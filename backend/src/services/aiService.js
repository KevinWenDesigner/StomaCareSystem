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

  // 获取系统提示词（基于DET评分表的造口周围皮炎评估）
  static getSystemPrompt() {
    return `你是一位专业的造口护理专家。请基于 DET 评分表（造口周围皮肤分表）分析造口及周围皮肤状况。

【第一步：识别图片类型】
判断图片内容：
- 造口（肠造口、尿路造口等医疗造口）→ wound_type: "stoma", can_assess: true
- 其他（伤口、皮肤病变、正常皮肤、无关物体）→ wound_type: "other", can_assess: false

⚠️ 重要：本系统仅评估造口周围皮炎，不评估伤口。

【第二步：DET评分评估】（仅针对造口）

1. 造口本体评估：
   - 颜色：粉红色/红色为正常，紫色/苍白/黑色为异常
   - 大小：记录尺寸（如"约3cm"）
   - 形态：描述形状、突出程度等

2. 造口周围皮肤DET评分（0-15分）：

【症状1：D-变色 (Discoloration)】0-5分
1a. 皮肤变色面积（0-3分）：
   - 0分：没有变色
   - 1分：变色面积 < 25%
   - 2分：变色面积 25%-50%
   - 3分：变色面积 > 50%

1b. 变色严重程度（0-2分）：
   - 0分：无变色
   - 1分：轻度颜色改变
   - 2分：颜色改变并伴有并发症（水肿、发红、瘙痒、疼痛、灼热等）

症状1得分 = 1a + 1b（0-5分）

【症状2：E-侵蚀 (Erosion)】0-5分
2a. 侵蚀/溃疡面积（0-3分）：
   - 0分：没有侵蚀
   - 1分：底盘覆盖下侵蚀面积 < 25%
   - 2分：底盘覆盖下侵蚀面积 25%-50%
   - 3分：底盘覆盖下侵蚀面积 > 50%

2b. 侵蚀严重程度（0-2分）：
   - 0分：无侵蚀
   - 1分：病损累及表层
   - 2分：病损累及表皮层及伴有并发症（溃疡、深部或病灶）

症状2得分 = 2a + 2b（0-5分）

【症状3：T-组织增生 (Tissue overgrowth)】0-5分
3a. 组织增生面积（0-3分）：
   - 0分：没有组织增生
   - 1分：底盘覆盖下组织增生面积 < 25%
   - 2分：底盘覆盖下组织增生面积 25%-50%
   - 3分：底盘覆盖下组织增生面积 > 50%

3b. 组织增生严重程度（0-2分）：
   - 0分：无组织增生
   - 1分：皮肤表面略高于周围组织
   - 2分：皮肤表面明显高于周围组织并伴有并发症（出血、瘙痒、溃疡）

症状3得分 = 3a + 3b（0-5分）

【DET总分 = 症状1 + 症状2 + 症状3（0-15分）】

请以 JSON 格式返回结果：
{
  "can_assess": true/false,
  "wound_type": "stoma/other",
  "stoma_color": "造口颜色描述（如'粉红色'、'红色'、'暗红色'等）",
  "stoma_size": "造口大小描述（如'约3cm'、'正常大小'等）",
  "stoma_shape": "造口形态描述",
  
  "det_score": {
    "d_discoloration_area": 0-3,
    "d_discoloration_severity": 0-2,
    "d_total": 0-5,
    "e_erosion_area": 0-3,
    "e_erosion_severity": 0-2,
    "e_total": 0-5,
    "t_tissue_area": 0-3,
    "t_tissue_severity": 0-2,
    "t_total": 0-5,
    "total": 0-15
  },
  
  "skin_condition": "基于DET评分的皮肤状况综合描述",
  "det_level": "excellent/good/moderate/poor/critical",
  "issues": ["具体问题列表，如'轻度变色'、'轻度侵蚀'等"],
  "confidence": 0.85,
  "detailed_analysis": "详细分析，包含DET各项评分依据",
  "not_assessable_reason": "如果无法评估（不是造口），说明原因"
}

【DET评分等级划分】：
- 优秀 (excellent): 0分（无皮炎）
- 良好 (good): 1-3分（轻度皮炎）
- 中度 (moderate): 4-7分（中度皮炎）
- 较差 (poor): 8-11分（重度皮炎）
- 严重 (critical): 12-15分（极重度皮炎）

注意：
- 仅评估造口，不评估伤口（can_assess: true 仅当 wound_type: "stoma"）
- 非造口图片一律 can_assess: false
- 必须提供DET三个症状的详细评分
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

  // 处理AI返回结果（基于DET评分）
  static processAIResult(aiData) {
    // 检查是否可以评估
    const canAssess = aiData.can_assess !== false;
    const woundType = aiData.wound_type || 'other';
    
    // 如果无法评估（不是造口）
    if (!canAssess || woundType !== 'stoma') {
      return {
        canAssess: false,
        woundType: woundType,
        notAssessableReason: aiData.not_assessable_reason || aiData.notAssessableReason || '图片中未识别到造口。本系统仅评估造口周围皮炎，不评估伤口。',
        stomaColor: '无法评估',
        stomaSize: '无法评估',
        stomaShape: '无法评估',
        skinCondition: '无法评估',
        detScore: null,
        detLevel: 'invalid',
        detLevelText: '无法评估',
        riskLevel: 'invalid',
        score: 0,
        issues: ['图片不是造口，无法进行评估。本系统仅评估造口周围皮炎。'],
        suggestions: ['请上传清晰的造口照片'],
        confidence: aiData.confidence || 0.9,
        detailedAnalysis: aiData.detailed_analysis || '该图片不是造口，无法进行评估。本系统专注于造口周围皮炎评估。',
        // 无法评估时，所有健康指标均为0
        healthMetrics: {
          discoloration: 0,    // 变色程度: 0%
          erosion: 0,          // 侵蚀程度: 0%
          tissueGrowth: 0,     // 组织增生: 0%
          overall: 100         // 整体健康度: 100%（无数据）
        },
        rawData: aiData
      };
    }
    
    // 可以评估（造口）
    const detScore = aiData.det_score || {
      d_discoloration_area: 0,
      d_discoloration_severity: 0,
      d_total: 0,
      e_erosion_area: 0,
      e_erosion_severity: 0,
      e_total: 0,
      t_tissue_area: 0,
      t_tissue_severity: 0,
      t_total: 0,
      total: 0
    };
    
    const detLevel = aiData.det_level || this.getDETLevelFromScore(detScore.total);
    
    // 基于 DET 评分计算健康指标
    const healthMetrics = this.calculateHealthMetricsFromDET(detScore);
    
    return {
      canAssess: true,
      woundType: 'stoma',
      isStoma: true,
      stomaColor: aiData.stoma_color || '粉红色',
      stomaSize: aiData.stoma_size || '正常',
      stomaShape: aiData.stoma_shape || '正常',
      skinCondition: aiData.skin_condition || '良好',
      
      // DET评分相关
      detScore: detScore,              // DET详细评分（0-15分）
      detLevel: detLevel,              // DET等级（excellent/good/moderate/poor/critical）
      detLevelText: this.getDETLevelText(detLevel),  // DET等级中文
      
      // score直接存储DET总分（0-15分）
      riskLevel: detLevel,             // 风险等级（兼容）
      score: detScore.total,           // DET总分（0-15分）
      
      issues: aiData.issues || [],
      suggestions: this.generateSuggestionsByDET(aiData, detScore, detLevel),
      confidence: aiData.confidence || 0.85,
      detailedAnalysis: aiData.detailed_analysis || aiData.detailedAnalysis || '',
      healthMetrics: healthMetrics,    // 健康指标
      rawData: aiData
    };
  }
  
  // 从DET总分得到等级
  static getDETLevelFromScore(detTotal) {
    if (detTotal === 0) return 'excellent';      // 0分：优秀（无皮炎）
    if (detTotal >= 1 && detTotal <= 3) return 'good';     // 1-3分：良好（轻度皮炎）
    if (detTotal >= 4 && detTotal <= 7) return 'moderate'; // 4-7分：中度（中度皮炎）
    if (detTotal >= 8 && detTotal <= 11) return 'poor';    // 8-11分：较差（重度皮炎）
    if (detTotal >= 12 && detTotal <= 15) return 'critical'; // 12-15分：严重（极重度皮炎）
    return 'excellent'; // 默认优秀
  }
  
  // 获取DET等级中文文本
  static getDETLevelText(detLevel) {
    const levelMap = {
      'excellent': '优秀（无皮炎）',
      'good': '良好（轻度皮炎）',
      'moderate': '中度（中度皮炎）',
      'poor': '较差（重度皮炎）',
      'critical': '严重（极重度皮炎）',
      'invalid': '无法评估'
    };
    return levelMap[detLevel] || '未知状态';
  }
  
  
  // 基于DET评分计算健康指标
  static calculateHealthMetricsFromDET(detScore) {
    // DET评分：变色(0-5) + 侵蚀(0-5) + 组织增生(0-5) = 总分(0-15)
    
    const dTotal = detScore.d_total || 0;  // 变色评分
    const eTotal = detScore.e_total || 0;  // 侵蚀评分
    const tTotal = detScore.t_total || 0;  // 组织增生评分
    const total = detScore.total || 0;     // 总评分
    
    // 将各项评分转换为百分比（0-5分 → 0-100%）
    // 注意：评分越高表示问题越严重
    const discoloration = Math.round((dTotal / 5) * 100);    // 变色程度（0-100%）
    const erosion = Math.round((eTotal / 5) * 100);          // 侵蚀程度（0-100%）
    const tissueGrowth = Math.round((tTotal / 5) * 100);     // 组织增生程度（0-100%）
    
    // 整体健康度：评分越低越好，0分=100%健康
    const overall = Math.round(100 - (total / 15) * 100);
    
    return {
      discoloration: discoloration,    // 变色程度: 0-100%
      erosion: erosion,                // 侵蚀程度: 0-100%
      tissueGrowth: tissueGrowth,      // 组织增生: 0-100%
      overall: overall                 // 整体健康度: 0-100%（越高越好）
    };
  }
  

  // 根据DET评分生成护理建议
  static generateSuggestionsByDET(aiData, detScore, detLevel) {
    const suggestions = [];
    const total = detScore.total || 0;
    const dTotal = detScore.d_total || 0;
    const eTotal = detScore.e_total || 0;
    const tTotal = detScore.t_total || 0;
    
    // 基础建议
    suggestions.push('定期观察造口及周围皮肤状况');
    
    // 根据DET等级给出专业建议
    switch(detLevel) {
      case 'excellent':
        // 0分：无皮炎
        suggestions.push('✨ 造口周围皮肤状况优秀，无皮炎');
        suggestions.push('继续保持现有护理方案');
        suggestions.push('保持造口周围皮肤清洁干燥');
        suggestions.push('定期更换造口袋，预防并发症');
        suggestions.push('建议每周进行自我评估');
        break;
        
      case 'good':
        // 1-3分：轻度皮炎
        suggestions.push('⚠️ 检测到轻度皮炎（DET: ' + total + '分）');
        
        if (dTotal > 0) {
          suggestions.push('• 变色(' + dTotal + '分)：使用皮肤保护膜，减少刺激');
        }
        if (eTotal > 0) {
          suggestions.push('• 侵蚀(' + eTotal + '分)：使用皮肤保护粉，保持干燥');
        }
        if (tTotal > 0) {
          suggestions.push('• 组织增生(' + tTotal + '分)：调整底盘尺寸，避免摩擦');
        }
        
        suggestions.push('检查造口底盘是否贴合适当');
        suggestions.push('避免使用刺激性清洁产品');
        suggestions.push('建议3-5天内联系造口护理师评估');
        break;
        
      case 'moderate':
        // 4-7分：中度皮炎
        suggestions.push('⚠️ 检测到中度皮炎（DET: ' + total + '分）');
        
        if (dTotal >= 2) {
          suggestions.push('• 变色(' + dTotal + '分)：皮肤变色明显，使用皮肤保护剂');
        }
        if (eTotal >= 2) {
          suggestions.push('• 侵蚀(' + eTotal + '分)：皮肤有破损，使用造口护肤膏');
        }
        if (tTotal >= 2) {
          suggestions.push('• 组织增生(' + tTotal + '分)：考虑更换凸面底盘');
        }
        
        suggestions.push('考虑更换低致敏性造口底盘');
        suggestions.push('增加底盘更换频率');
        suggestions.push('保持造口周围皮肤清洁和干燥');
        suggestions.push('⚠️ 建议2-3天内联系造口护理师');
        break;
        
      case 'poor':
        // 8-11分：重度皮炎
        suggestions.push('🚨 检测到重度皮炎（DET: ' + total + '分）');
        
        if (dTotal >= 3) {
          suggestions.push('• 变色(' + dTotal + '分)：大面积变色，需专业处理');
        }
        if (eTotal >= 3) {
          suggestions.push('• 侵蚀(' + eTotal + '分)：严重侵蚀，可能需要药物治疗');
        }
        if (tTotal >= 3) {
          suggestions.push('• 组织增生(' + tTotal + '分)：明显增生，需专业评估');
        }
        
        suggestions.push('停止使用可能引起刺激的产品');
        suggestions.push('需要专业造口护理师介入');
        suggestions.push('可能需要使用处方药膏');
        suggestions.push('🚨 建议1-2天内就医或联系护理师');
        break;
        
      case 'critical':
        // 12-15分：极重度皮炎
        suggestions.push('🚨🚨 严重皮炎警告（DET: ' + total + '分）');
        suggestions.push('🚨 立即联系医生或造口专科护理师！');
        
        if (dTotal >= 4) {
          suggestions.push('• 变色严重(' + dTotal + '分)：需紧急处理');
        }
        if (eTotal >= 4) {
          suggestions.push('• 侵蚀严重(' + eTotal + '分)：可能需要清创和药物治疗');
        }
        if (tTotal >= 4) {
          suggestions.push('• 组织增生严重(' + tTotal + '分)：可能需要外科干预');
        }
        
        suggestions.push('停止所有自行护理措施');
        suggestions.push('保持造口清洁，避免感染');
        suggestions.push('密切观察感染迹象（发热、脓液、异味）');
        suggestions.push('🚨 紧急！请当日就医');
        break;
        
      default:
        suggestions.push('保持造口周围皮肤清洁干燥');
        suggestions.push('定期更换造口袋');
    }
    
    // 通用护理建议
    suggestions.push('按时更换造口袋，避免渗漏');
    suggestions.push('注意饮食调理，避免产气食物');
    suggestions.push('保持良好的个人卫生习惯');
    
    return suggestions;
  }

  // 获取模拟分析结果（基于DET评分）
  static getMockAnalysisResult() {
    const colors = ['粉红色', '红色', '暗红色'];
    const sizes = ['正常', '约3cm', '约2cm'];
    const shapes = ['规则圆形', '椭圆形', '略突出'];
    
    // 随机生成DET评分 (倾向于低分，因为大多数情况是良好的)
    const dArea = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 3);
    const dSeverity = dArea > 0 ? Math.floor(Math.random() * 2) : 0;
    const dTotal = dArea + dSeverity;
    
    const eArea = Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 3);
    const eSeverity = eArea > 0 ? Math.floor(Math.random() * 2) : 0;
    const eTotal = eArea + eSeverity;
    
    const tArea = Math.random() < 0.85 ? 0 : Math.floor(Math.random() * 3);
    const tSeverity = tArea > 0 ? Math.floor(Math.random() * 2) : 0;
    const tTotal = tArea + tSeverity;
    
    const totalScore = dTotal + eTotal + tTotal;
    
    // 根据评分生成对应的问题列表
    const issues = [];
    if (dTotal > 0) issues.push(`造口周围皮肤变色（${dTotal}分）`);
    if (eTotal > 0) issues.push(`皮肤侵蚀（${eTotal}分）`);
    if (tTotal > 0) issues.push(`组织增生（${tTotal}分）`);
    
    const mockData = {
      can_assess: true,
      wound_type: 'stoma',
      stoma_color: colors[Math.floor(Math.random() * colors.length)],
      stoma_size: sizes[Math.floor(Math.random() * sizes.length)],
      stoma_shape: shapes[Math.floor(Math.random() * shapes.length)],
      det_score: {
        d_discoloration_area: dArea,
        d_discoloration_severity: dSeverity,
        d_total: dTotal,
        e_erosion_area: eArea,
        e_erosion_severity: eSeverity,
        e_total: eTotal,
        t_tissue_area: tArea,
        t_tissue_severity: tSeverity,
        t_total: tTotal,
        total: totalScore
      },
      skin_condition: this.generateSkinConditionText(dTotal, eTotal, tTotal),
      det_level: this.getDETLevelFromScore(totalScore),
      confidence: 0.75 + Math.random() * 0.2,
      issues: issues,
      detailed_analysis: this.generateMockDetailedAnalysis(dTotal, eTotal, tTotal, totalScore)
    };
    
    return this.processAIResult(mockData);
  }
  
  // 生成皮肤状况描述文本
  static generateSkinConditionText(dTotal, eTotal, tTotal) {
    if (dTotal === 0 && eTotal === 0 && tTotal === 0) {
      return '造口周围皮肤完整无损，颜色正常，无侵蚀或组织增生';
    }
    
    const parts = [];
    if (dTotal > 0) {
      parts.push(dTotal >= 3 ? '明显变色' : '轻微变色');
    }
    if (eTotal > 0) {
      parts.push(eTotal >= 3 ? '明显侵蚀' : '轻微侵蚀');
    }
    if (tTotal > 0) {
      parts.push(tTotal >= 3 ? '明显组织增生' : '轻微组织增生');
    }
    
    return `造口周围皮肤存在${parts.join('、')}`;
  }
  
  // 生成模拟的详细分析
  static generateMockDetailedAnalysis(dTotal, eTotal, tTotal, total) {
    let analysis = `【DET评分详细分析】\n\n`;
    analysis += `总分：${total}/15分\n\n`;
    
    analysis += `1. D-变色（${dTotal}/5分）：`;
    if (dTotal === 0) {
      analysis += `造口周围皮肤颜色正常，无变色现象。\n`;
    } else {
      analysis += `检测到造口周围皮肤变色，${dTotal >= 3 ? '面积较大且' : ''}${dTotal % 2 === 0 ? '程度较重' : '程度较轻'}。\n`;
    }
    
    analysis += `\n2. E-侵蚀（${eTotal}/5分）：`;
    if (eTotal === 0) {
      analysis += `造口周围皮肤完整，无侵蚀或溃疡。\n`;
    } else {
      analysis += `检测到皮肤侵蚀，${eTotal >= 3 ? '范围较大且' : ''}${eTotal % 2 === 0 ? '深度较深' : '浅表层损伤'}。\n`;
    }
    
    analysis += `\n3. T-组织增生（${tTotal}/5分）：`;
    if (tTotal === 0) {
      analysis += `造口周围皮肤平整，无组织增生。\n`;
    } else {
      analysis += `检测到组织增生，${tTotal >= 3 ? '面积较大且' : ''}${tTotal % 2 === 0 ? '明显高于周围组织' : '略高于周围组织'}。\n`;
    }
    
    analysis += `\n【结论】：`;
    if (total === 0) {
      analysis += `造口周围皮肤状况优秀，无皮炎迹象，建议继续保持现有护理方案。`;
    } else if (total <= 3) {
      analysis += `检测到轻度皮炎，建议加强护理，3-5天内复查。`;
    } else if (total <= 7) {
      analysis += `检测到中度皮炎，建议调整护理方案，2-3天内联系护理师。`;
    } else if (total <= 11) {
      analysis += `检测到重度皮炎，建议尽快就医，1-2天内联系专业护理师。`;
    } else {
      analysis += `检测到极重度皮炎，建议立即就医处理！`;
    }
    
    return analysis;
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

    // 使用DET评分计算趋势（0-15分，分数越高越严重）
    const recentScore = assessments[0].score || 0;
    const previousScore = assessments[1].score || 0;

    let trend = 'stable';
    let message = '状况稳定';

    // 注意：DET评分越高表示越严重，所以分数下降是改善，分数上升是恶化
    if (recentScore < previousScore - 1) {
      trend = 'improving';
      message = '造口周围皮肤状况改善，DET评分下降，请继续保持良好护理';
    } else if (recentScore > previousScore + 1) {
      trend = 'worsening';
      message = '造口周围皮肤状况恶化，DET评分上升，建议加强护理并咨询护理师';
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
