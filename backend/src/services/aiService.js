const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class AIService {
  // AI分析造口/伤口图片
  static async analyzeImage(imagePath) {
    try {
      const aiProvider = process.env.AI_PROVIDER || 'mock';
      
      console.log(`使用 AI 提供商: ${aiProvider}`);
      
      // 根据不同的AI提供商调用不同的服务
      switch (aiProvider) {
        case 'qwen':
        case 'tongyi':
          return await this.analyzeWithQwen(imagePath);
        case 'deepseek':
          return await this.analyzeWithDeepSeek(imagePath);
        case 'custom':
          return await this.analyzeWithCustomAI(imagePath);
        default:
          console.warn('未配置AI服务或使用模拟模式');
          return this.getMockAnalysisResult();
      }
    } catch (error) {
      console.error('AI分析错误:', error.message);
      console.error('错误详情:', error);
      // 如果AI服务失败，返回模拟数据
      return this.getMockAnalysisResult();
    }
  }

  // 使用 DeepSeek API 分析图片
  static async analyzeWithDeepSeek(imagePath) {
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
      
      if (!apiKey) {
        throw new Error('未配置 DEEPSEEK_API_KEY');
      }

      // 读取图片并转换为 base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const imageExtension = imagePath.split('.').pop().toLowerCase();
      const mimeType = this.getMimeType(imageExtension);

      console.log('调用 DeepSeek API 进行图像分析...');

      // 构建 DeepSeek API 请求
      const response = await axios.post(
        apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '请分析这张图片，判断是造口还是伤口并提供专业评估。'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 60000
        }
      );

      console.log('DeepSeek API 响应成功');
      
      const aiResponse = response.data.choices[0].message.content;
      let aiData;
      
      try {
        aiData = JSON.parse(aiResponse);
      } catch (e) {
        console.error('解析 AI 响应失败，使用文本解析:', e);
        aiData = this.parseTextResponse(aiResponse);
      }

      console.log('DeepSeek 分析结果:', aiData);
      
      return this.processAIResult(aiData);
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error.message);
      if (error.response) {
        console.error('API 错误响应:', error.response.data);
      }
      throw error;
    }
  }

  // 使用阿里云通义千问 VL 分析图片
  static async analyzeWithQwen(imagePath) {
    try {
      const apiKey = process.env.QWEN_API_KEY;
      const apiUrl = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      const model = process.env.QWEN_MODEL || 'qwen-vl-max';
      
      if (!apiKey) {
        throw new Error('未配置 QWEN_API_KEY');
      }

      // 读取图片并转换为 base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const imageExtension = imagePath.split('.').pop().toLowerCase();
      const mimeType = this.getMimeType(imageExtension);

      console.log(`调用通义千问 ${model} API 进行图像分析...`);

      // 构建通义千问 API 请求（兼容 OpenAI 格式）
      const response = await axios.post(
        apiUrl,
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '请分析这张图片，判断是造口还是伤口并提供专业评估。如果都不是，请说明原因。'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 60000 // 60秒超时
        }
      );

      console.log('通义千问 API 响应成功');
      
      // 解析 AI 返回的结果
      const aiResponse = response.data.choices[0].message.content;
      let aiData;
      
      try {
        // 尝试直接解析 JSON
        aiData = JSON.parse(aiResponse);
      } catch (e) {
        console.warn('通义千问返回非 JSON 格式，尝试提取信息...');
        // 如果不是纯 JSON，尝试从文本中提取 JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            aiData = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            console.error('解析 JSON 失败，使用文本解析:', e2);
            aiData = this.parseTextResponse(aiResponse);
          }
        } else {
          aiData = this.parseTextResponse(aiResponse);
        }
      }

      console.log('通义千问分析结果:', aiData);
      
      return this.processAIResult(aiData);
    } catch (error) {
      console.error('通义千问 API 调用失败:', error.message);
      if (error.response) {
        console.error('API 错误响应:', error.response.data);
      }
      throw error;
    }
  }

  // 使用自定义 AI API 分析图片
  static async analyzeWithCustomAI(imagePath) {
    const aiApiUrl = process.env.AI_API_URL;
    
    if (!aiApiUrl) {
      throw new Error('未配置 AI_API_URL');
    }

    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(aiApiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.AI_API_KEY || ''}`
      },
      timeout: 30000
    });

    return this.processAIResult(response.data);
  }

  // 获取系统提示词（支持造口和伤口评估）
  static getSystemPrompt() {
    return `你是一位专业的造口护理和伤口管理专家。请基于 NPUAP/EPUAP/PPPIA 2019 国际标准分析图片。

【第一步：识别图片类型】
判断图片内容：
- 造口（肠造口、尿路造口等医疗造口）→ wound_type: "stoma", can_assess: true
- 伤口（切口、擦伤、烧伤、压疮、溃疡等）→ wound_type: "wound", can_assess: true
- 其他（皮肤病变、正常皮肤、无关物体）→ wound_type: "other", can_assess: false

【第二步：专业评估】（造口或伤口都可以评估）

1. 伤口/造口本体评估：
   - 颜色：粉红色/红色为正常，紫色/苍白/黑色为异常
   - 大小：记录尺寸，评估是否正常
   - 形态：描述形状、边缘、深度等

2. 周围皮肤评估（基于 NPUAP/EPUAP/PPPIA 压疮分级标准）：
   
   Normal（正常）- 评分：90-100分
   - 皮肤完整无损，无红斑、破损或其他异常
   - pressure_stage: "normal"
   
   Stage I（I期）- 评分：75-89分
   - 皮肤完整，局部非漂白性红斑（按压不褪色）
   - 可能伴有疼痛、硬结或温度变化
   - pressure_stage: "stage_1"
   
   Stage II（II期）- 评分：60-74分
   - 皮肤部分层损伤（表皮及/或真皮浅层）
   - 形成浅溃疡、水疱或破损表皮
   - pressure_stage: "stage_2"
   
   Stage III（III期）- 评分：40-59分
   - 皮肤全层损伤，皮下脂肪可见
   - 未达筋膜，可伴有隧道或窦道
   - pressure_stage: "stage_3"
   
   Stage IV（IV期）- 评分：20-39分
   - 深部全层损伤，可见骨、肌腱或筋膜
   - 常伴有焦痂或坏死组织
   - pressure_stage: "stage_4"
   
   DTPI（深部组织压伤）- 评分：30-50分
   - 皮下组织深层损伤，皮肤表面紫红或暗红
   - 可能后期破溃
   - pressure_stage: "dtpi"
   
   Unstageable（不可分期）- 评分：10-19分
   - 被焦痂/坏死组织覆盖，无法判断深度
   - pressure_stage: "unstageable"

3. 智能评分（0-100分）：
   综合考虑伤口/造口本体状况和周围皮肤NPUAP分期
   评分必须与 pressure_stage 对应

请以 JSON 格式返回结果：
{
  "can_assess": true/false,
  "wound_type": "stoma/wound/other",
  "stoma_color": "颜色描述（造口用）或 伤口颜色描述（伤口用）",
  "stoma_size": "大小评估",
  "skin_condition": "基于NPUAP标准的皮肤状况描述",
  "pressure_stage": "normal/stage_1/stage_2/stage_3/stage_4/dtpi/unstageable",
  "score": 85,
  "issues": ["问题列表"],
  "confidence": 0.85,
  "detailed_analysis": "详细分析，包含NPUAP分期依据和类型判断",
  "not_assessable_reason": "如果无法评估，说明原因"
}

注意：
- 造口和伤口都可以评估（can_assess: true）
- 只有非伤口/造口图片才无法评估（can_assess: false）
- 评分必须与 pressure_stage 对应
- 使用专业医学术语`;
  }

  // 获取 MIME 类型
  static getMimeType(extension) {
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  // 从文本响应中解析信息（备用方案）
  static parseTextResponse(text) {
    const data = {
      can_assess: true,
      wound_type: 'wound',
      stoma_color: '粉红色',
      stoma_size: '正常',
      skin_condition: '良好',
      pressure_stage: 'normal',
      score: 80,
      confidence: 0.75,
      issues: [],
      detailed_analysis: text
    };

    // 简单的关键词匹配
    const lowerText = text.toLowerCase();
    if (lowerText.includes('红肿') || lowerText.includes('发红')) {
      data.pressure_stage = 'stage_1';
      data.score = 78;
      data.issues.push('周围皮肤发红');
    }
    if (lowerText.includes('破损') || lowerText.includes('溃疡')) {
      data.pressure_stage = 'stage_2';
      data.score = 65;
      data.issues.push('皮肤破损');
    }
    if (lowerText.includes('感染') || lowerText.includes('脓液')) {
      data.pressure_stage = 'stage_3';
      data.score = 45;
      data.issues.push('可能存在感染');
    }

    return data;
  }

  // 处理AI返回结果
  static processAIResult(aiData) {
    // 检查是否可以评估
    const canAssess = aiData.can_assess !== false;
    const woundType = aiData.wound_type || 'wound';
    
    // 如果无法评估（既不是造口也不是伤口）
    if (!canAssess || woundType === 'other') {
      return {
        canAssess: false,
        woundType: woundType,
        notAssessableReason: aiData.not_assessable_reason || aiData.notAssessableReason || '图片中未识别到造口或伤口',
        stomaColor: '无法评估',
        stomaSize: '无法评估',
        skinCondition: '无法评估',
        pressureStage: 'invalid',
        riskLevel: 'invalid',
        score: 0,
        issues: ['图片不是造口或伤口，无法进行评估'],
        suggestions: ['请上传造口或伤口图片'],
        confidence: aiData.confidence || 0.9,
        detailedAnalysis: aiData.detailed_analysis || '该图片不是造口或伤口，无法进行评估。',
        // 无法评估时，所有健康指标均为0
        healthMetrics: {
          redness: 0,      // 发红程度: 0%
          swelling: 0,     // 肿胀程度: 0%
          infection: 0,    // 感染风险: 0%
          healing: 0       // 愈合程度: 0%
        },
        rawData: aiData
      };
    }
    
    // 可以评估（造口或伤口）
    const pressureStage = aiData.pressure_stage || aiData.pressureStage || 'normal';
    
    // 基于 NPUAP 分期计算健康指标
    const healthMetrics = this.calculateHealthMetrics(pressureStage, aiData);
    
    return {
      canAssess: true,
      woundType: woundType,  // stoma 或 wound
      isStoma: woundType === 'stoma',  // 兼容旧字段
      stomaColor: aiData.stoma_color || '粉红色',
      stomaSize: aiData.stoma_size || '正常',
      skinCondition: aiData.skin_condition || '良好',
      pressureStage: pressureStage,
      riskLevel: pressureStage,  // 兼容旧字段
      score: aiData.score || this.calculateScoreFromStage(pressureStage),
      issues: aiData.issues || [],
      suggestions: this.generateSuggestionsByStage(aiData, pressureStage, woundType),
      confidence: aiData.confidence || 0.85,
      detailedAnalysis: aiData.detailed_analysis || aiData.detailedAnalysis || '',
      healthMetrics: healthMetrics,  // 健康指标
      rawData: aiData
    };
  }
  
  // 基于 NPUAP 分期标准计算健康指标
  static calculateHealthMetrics(pressureStage, aiData) {
    // NPUAP 分期与健康指标映射
    const metricsMap = {
      // 正常状态（90-100分）
      'normal': {
        redness: 0,       // 无发红
        swelling: 0,      // 无肿胀
        infection: 5,     // 极低感染风险
        healing: 100      // 完全愈合/健康
      },
      // I期压疮（75-89分）- 非漂白性红斑
      'stage_1': {
        redness: 40,      // 轻度发红（非漂白性红斑）
        swelling: 20,     // 轻度肿胀
        infection: 20,    // 低感染风险
        healing: 75       // 轻度影响愈合
      },
      'stage-1': {
        redness: 40,
        swelling: 20,
        infection: 20,
        healing: 75
      },
      // II期压疮（60-74分）- 部分层损伤
      'stage_2': {
        redness: 60,      // 中度发红（炎症反应）
        swelling: 40,     // 中度肿胀
        infection: 40,    // 中等感染风险
        healing: 60       // 中度影响愈合
      },
      'stage-2': {
        redness: 60,
        swelling: 40,
        infection: 40,
        healing: 60
      },
      // III期压疮（40-59分）- 全层损伤
      'stage_3': {
        redness: 80,      // 重度发红（明显炎症）
        swelling: 60,     // 重度肿胀
        infection: 70,    // 高感染风险
        healing: 40       // 严重影响愈合
      },
      'stage-3': {
        redness: 80,
        swelling: 60,
        infection: 70,
        healing: 40
      },
      // IV期压疮（20-39分）- 深部全层损伤
      'stage_4': {
        redness: 95,      // 极重度发红
        swelling: 80,     // 极重度肿胀
        infection: 90,    // 极高感染风险
        healing: 20       // 极差愈合情况
      },
      'stage-4': {
        redness: 95,
        swelling: 80,
        infection: 90,
        healing: 20
      },
      // DTPI 深部组织压伤（30-50分）
      'dtpi': {
        redness: 70,      // 深部组织变色（紫红色）
        swelling: 50,     // 明显肿胀
        infection: 60,    // 较高感染风险
        healing: 45       // 较差愈合情况
      },
      // 不可分期（10-19分）- 焦痂覆盖
      'unstageable': {
        redness: 50,      // 无法判断（被覆盖）
        swelling: 50,     // 无法判断
        infection: 85,    // 很高感染风险（坏死组织）
        healing: 15       // 极差愈合（需清创）
      },
      // 无效状态
      'invalid': {
        redness: 0,
        swelling: 0,
        infection: 0,
        healing: 0
      }
    };
    
    // 获取基础指标
    const baseMetrics = metricsMap[pressureStage] || metricsMap['normal'];
    
    // 如果AI提供了更详细的分析，进行微调
    const finalMetrics = { ...baseMetrics };
    
    // 如果AI分析中提到了特定问题，增加相应指标
    const issues = aiData.issues || [];
    const detailedAnalysis = (aiData.detailed_analysis || '').toLowerCase();
    
    issues.forEach(issue => {
      const issueLower = issue.toLowerCase();
      if (issueLower.includes('红') || issueLower.includes('红斑')) {
        finalMetrics.redness = Math.min(100, finalMetrics.redness + 10);
      }
      if (issueLower.includes('肿') || issueLower.includes('水肿')) {
        finalMetrics.swelling = Math.min(100, finalMetrics.swelling + 10);
      }
      if (issueLower.includes('感染') || issueLower.includes('脓') || issueLower.includes('渗液')) {
        finalMetrics.infection = Math.min(100, finalMetrics.infection + 15);
      }
    });
    
    // 检查详细分析中的关键词
    if (detailedAnalysis.includes('红斑') || detailedAnalysis.includes('发红')) {
      finalMetrics.redness = Math.min(100, finalMetrics.redness + 5);
    }
    if (detailedAnalysis.includes('肿胀') || detailedAnalysis.includes('水肿')) {
      finalMetrics.swelling = Math.min(100, finalMetrics.swelling + 5);
    }
    if (detailedAnalysis.includes('感染') || detailedAnalysis.includes('化脓')) {
      finalMetrics.infection = Math.min(100, finalMetrics.infection + 10);
    }
    
    // 愈合程度与感染风险成反比
    finalMetrics.healing = Math.max(0, 100 - finalMetrics.infection);
    
    return finalMetrics;
  }
  
  // 根据 NPUAP 分期计算评分（备用）
  static calculateScoreFromStage(stage) {
    const scoreMap = {
      'normal': 95,
      'stage_1': 82,
      'stage-1': 82,
      'stage_2': 67,
      'stage-2': 67,
      'stage_3': 50,
      'stage-3': 50,
      'stage_4': 30,
      'stage-4': 30,
      'dtpi': 40,
      'unstageable': 15,
      'invalid': 0
    };
    return scoreMap[stage] || scoreMap[stage.replace('-', '_')] || 75;
  }

  // 根据 NPUAP 分期和类型生成护理建议
  static generateSuggestionsByStage(aiData, stage, woundType = 'wound') {
    const suggestions = [];
    
    // 基础建议
    if (woundType === 'stoma') {
      suggestions.push('定期观察造口及周围皮肤状况');
    } else {
      suggestions.push('定期观察伤口及周围皮肤状况');
    }
    
    // 根据 NPUAP 分期给出专业建议
    switch(stage) {
      case 'normal':
        if (woundType === 'stoma') {
          suggestions.push('造口状况良好，继续保持现有护理方案');
          suggestions.push('保持造口周围皮肤清洁干燥');
          suggestions.push('定期更换造口袋，预防并发症');
        } else {
          suggestions.push('伤口状况良好，继续保持现有护理方案');
          suggestions.push('保持伤口清洁干燥');
          suggestions.push('按医嘱定期换药');
        }
        break;
        
      case 'stage_1':
      case 'stage-1':
        suggestions.push('⚠️ I期压疮：发现非漂白性红斑');
        suggestions.push('减轻局部压力，避免摩擦和剪切力');
        suggestions.push('使用皮肤保护膜或水胶体敷料');
        if (woundType === 'stoma') {
          suggestions.push('确保造口底盘贴合适当，不过紧');
        }
        suggestions.push('建议3-5天内联系护理师评估');
        break;
        
      case 'stage_2':
      case 'stage-2':
        suggestions.push('⚠️ II期压疮：部分层皮肤损伤');
        suggestions.push('保持创面清洁，使用适当敷料');
        if (woundType === 'stoma') {
          suggestions.push('考虑更换低致敏性造口底盘');
          suggestions.push('使用皮肤保护粉或造口护肤膏');
        } else {
          suggestions.push('使用适当的伤口敷料保护创面');
          suggestions.push('避免创面受压和摩擦');
        }
        suggestions.push('⚠️ 建议2-3天内联系护理师');
        break;
        
      case 'stage_3':
      case 'stage-3':
        suggestions.push('🚨 III期压疮：全层皮肤损伤');
        suggestions.push('⚠️ 需要专业创面管理，请尽快就医');
        suggestions.push('停止使用可能引起刺激的产品');
        suggestions.push('保持创面清洁，预防感染');
        suggestions.push('🚨 建议当日联系医生或专业护理师');
        break;
        
      case 'stage_4':
      case 'stage-4':
        suggestions.push('🚨 IV期压疮：深部组织损伤');
        suggestions.push('🚨 立即就医！可能需要外科处理');
        suggestions.push('停止所有自行护理，保持创面清洁');
        suggestions.push('密切观察感染迹象');
        suggestions.push('🚨 紧急！请立即联系医生');
        break;
        
      case 'unstageable':
        suggestions.push('⚠️ 不可分期：存在焦痂或坏死组织');
        suggestions.push('需要专业清创评估');
        suggestions.push('🚨 请尽快就医，由专业人员处理');
        suggestions.push('不要自行清除坏死组织');
        break;
        
      case 'dtpi':
        suggestions.push('⚠️ 深部组织压伤：皮下损伤');
        suggestions.push('密切观察皮肤变化，可能会破溃');
        suggestions.push('减轻局部压力');
        suggestions.push('建议1-2天内联系专业护理师');
        break;
        
      default:
        if (woundType === 'stoma') {
          suggestions.push('保持造口周围皮肤清洁干燥');
          suggestions.push('定期更换造口袋');
        } else {
          suggestions.push('保持伤口清洁干燥');
          suggestions.push('按医嘱定期换药');
        }
    }
    
    // 通用护理建议
    if (woundType === 'stoma') {
      suggestions.push('按时更换造口袋，避免渗漏');
      suggestions.push('注意饮食调理，避免产气食物');
    } else {
      suggestions.push('避免伤口受压和污染');
      suggestions.push('保持营养均衡，促进伤口愈合');
    }
    
    return suggestions;
  }

  // 获取模拟分析结果
  static getMockAnalysisResult() {
    const stages = ['normal', 'stage_1', 'stage_2'];
    const woundTypes = ['stoma', 'wound'];
    const colors = ['粉红色', '红色', '暗红色'];
    const sizes = ['正常', '约3cm', '约2cm'];
    const skinConditions = ['皮肤完整无损', '轻微红斑', '皮肤完整'];
    
    const randomStage = stages[Math.floor(Math.random() * stages.length)];
    const randomType = woundTypes[Math.floor(Math.random() * woundTypes.length)];
    
    const mockData = {
      can_assess: true,
      wound_type: randomType,
      stoma_color: colors[Math.floor(Math.random() * colors.length)],
      stoma_size: sizes[Math.floor(Math.random() * sizes.length)],
      skin_condition: skinConditions[Math.floor(Math.random() * skinConditions.length)],
      pressure_stage: randomStage,
      score: this.calculateScoreFromStage(randomStage),
      confidence: 0.75 + Math.random() * 0.2,
      issues: randomStage !== 'normal' ? ['周围皮肤轻微问题'] : []
    };
    
    return this.processAIResult(mockData);
  }

  // 批量分析（对比多张图片）
  static async batchAnalyze(imagePaths) {
    const results = [];
    
    for (const imagePath of imagePaths) {
      try {
        const result = await this.analyzeImage(imagePath);
        results.push({
          imagePath,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          imagePath,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // 分析趋势（基于历史记录）
  static analyzeTrend(assessments) {
    if (!assessments || assessments.length < 2) {
      return {
        trend: 'insufficient_data',
        message: '数据不足，无法分析趋势'
      };
    }

    // 使用评分计算趋势
    const recentScore = assessments[0].score || 75;
    const previousScore = assessments[1].score || 75;

    let trend = 'stable';
    let message = '状况稳定';

    if (recentScore > previousScore + 5) {
      trend = 'improving';
      message = '状况持续改善，请继续保持';
    } else if (recentScore < previousScore - 5) {
      trend = 'worsening';
      message = '状况有恶化趋势，建议加强护理';
    }

    return {
      trend,
      message,
      recentScore,
      previousScore,
      scoreDifference: recentScore - previousScore,
      assessmentCount: assessments.length
    };
  }
}

module.exports = AIService;
