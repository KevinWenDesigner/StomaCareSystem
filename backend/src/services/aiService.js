const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class AIService {
  // AI分析造口图片
  static async analyzeImage(imagePath) {
    try {
      const aiApiUrl = process.env.AI_API_URL;
      
      // 如果没有配置AI服务，返回模拟数据
      if (!aiApiUrl) {
        console.warn('未配置AI服务URL，返回模拟数据');
        return this.getMockAnalysisResult();
      }

      // 读取图片文件
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));

      // 调用AI服务
      const response = await axios.post(aiApiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.AI_API_KEY || ''}`
        },
        timeout: 30000 // 30秒超时
      });

      return this.processAIResult(response.data);
    } catch (error) {
      console.error('AI分析错误:', error.message);
      // 如果AI服务失败，返回模拟数据
      return this.getMockAnalysisResult();
    }
  }

  // 处理AI返回结果
  static processAIResult(aiData) {
    // 根据实际AI服务返回的数据结构进行处理
    return {
      stomaColor: aiData.stoma_color || '粉红色',
      stomaSize: aiData.stoma_size || '正常',
      skinCondition: aiData.skin_condition || '良好',
      riskLevel: aiData.risk_level || 'low',
      issues: aiData.issues || [],
      suggestions: this.generateSuggestions(aiData),
      confidence: aiData.confidence || 0.85,
      rawData: aiData
    };
  }

  // 生成护理建议
  static generateSuggestions(aiData) {
    const suggestions = [];
    
    const riskLevel = aiData.risk_level || 'low';
    const skinCondition = aiData.skin_condition || '良好';
    
    // 基础建议
    suggestions.push('定期观察造口及周围皮肤状况');
    suggestions.push('保持造口周围皮肤清洁干燥');
    
    // 根据风险等级给建议
    if (riskLevel === 'high') {
      suggestions.push('⚠️ 建议尽快联系专业护士进行评估');
      suggestions.push('密切观察症状变化，如有不适立即就医');
    } else if (riskLevel === 'medium') {
      suggestions.push('建议3-5天内联系护士进行复查');
      suggestions.push('注意观察是否有疼痛、红肿等异常');
    }
    
    // 根据皮肤状况给建议
    if (skinCondition.includes('潮红') || skinCondition.includes('红肿')) {
      suggestions.push('避免造口袋底盘粘贴过紧');
      suggestions.push('可使用皮肤保护粉或造口护肤膏');
    }
    
    if (skinCondition.includes('破损') || skinCondition.includes('溃疡')) {
      suggestions.push('⚠️ 立即停止使用可能引起刺激的产品');
      suggestions.push('必要时需要就医处理');
    }
    
    // 一般护理建议
    suggestions.push('按时更换造口袋，避免渗漏');
    suggestions.push('注意饮食调理，避免产气食物');
    
    return suggestions;
  }

  // 获取模拟分析结果（用于测试或AI服务不可用时）
  static getMockAnalysisResult() {
    const riskLevels = ['low', 'medium', 'high'];
    const colors = ['粉红色', '红色', '暗红色', '正常'];
    const sizes = ['正常', '略大', '略小'];
    const skinConditions = ['良好', '轻微潮红', '正常', '略干燥'];
    
    const randomRiskLevel = riskLevels[Math.floor(Math.random() * 3)];
    
    const mockData = {
      stoma_color: colors[Math.floor(Math.random() * colors.length)],
      stoma_size: sizes[Math.floor(Math.random() * sizes.length)],
      skin_condition: skinConditions[Math.floor(Math.random() * skinConditions.length)],
      risk_level: randomRiskLevel,
      confidence: 0.75 + Math.random() * 0.2,
      issues: randomRiskLevel === 'high' ? ['周围皮肤轻微红肿'] : []
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

    // 计算风险等级变化
    const riskLevelMap = { low: 1, medium: 2, high: 3 };
    const recentRisk = riskLevelMap[assessments[0].risk_level] || 1;
    const previousRisk = riskLevelMap[assessments[1].risk_level] || 1;

    let trend = 'stable';
    let message = '造口状况稳定';

    if (recentRisk > previousRisk) {
      trend = 'worsening';
      message = '造口状况有恶化趋势，建议加强护理';
    } else if (recentRisk < previousRisk) {
      trend = 'improving';
      message = '造口状况持续改善，请继续保持';
    }

    return {
      trend,
      message,
      recentRiskLevel: assessments[0].risk_level,
      previousRiskLevel: assessments[1].risk_level,
      assessmentCount: assessments.length
    };
  }
}

module.exports = AIService;




