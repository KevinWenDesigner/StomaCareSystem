// 评估对比功能增强 - 可选添加到 assessmentController.js

/**
 * 批量对比评估记录
 * POST /api/assessments/compare
 * Body: { assessmentIds: [id1, id2, id3, ...] }
 */
static async compareAssessments(req, res, next) {
  try {
    const { assessmentIds } = req.body;
    
    if (!Array.isArray(assessmentIds) || assessmentIds.length < 2) {
      return response.error(res, '至少需要2条评估记录进行对比');
    }
    
    if (assessmentIds.length > 5) {
      return response.error(res, '最多支持5条评估记录对比');
    }
    
    // 获取所有评估记录
    const assessments = await Promise.all(
      assessmentIds.map(id => Assessment.findById(id))
    );
    
    // 过滤掉不存在的记录
    const validAssessments = assessments.filter(a => a !== null);
    
    if (validAssessments.length < 2) {
      return response.error(res, '有效的评估记录不足2条');
    }
    
    // 按时间排序
    validAssessments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // 计算对比数据
    const comparisonResult = this.calculateComparison(validAssessments);
    
    return response.success(res, {
      assessments: validAssessments,
      comparison: comparisonResult,
      metadata: {
        count: validAssessments.length,
        timeSpan: this.calculateTimeSpan(validAssessments[0].createdAt, validAssessments[validAssessments.length - 1].createdAt)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 计算对比数据
 */
static calculateComparison(assessments) {
  if (assessments.length < 2) {
    return null;
  }
  
  const first = assessments[0];
  const last = assessments[assessments.length - 1];
  
  // 提取健康指标
  const getMetrics = (assessment) => {
    const stage = assessment.pressureStage || assessment.riskLevel;
    return this.getHealthMetricsFromStage(stage);
  };
  
  const firstMetrics = getMetrics(first);
  const lastMetrics = getMetrics(last);
  
  // 计算指标变化
  const metricsComparison = {
    redness: {
      before: firstMetrics.redness,
      after: lastMetrics.redness,
      change: lastMetrics.redness - firstMetrics.redness,
      improved: lastMetrics.redness < firstMetrics.redness
    },
    swelling: {
      before: firstMetrics.swelling,
      after: lastMetrics.swelling,
      change: lastMetrics.swelling - firstMetrics.swelling,
      improved: lastMetrics.swelling < firstMetrics.swelling
    },
    infection: {
      before: firstMetrics.infection,
      after: lastMetrics.infection,
      change: lastMetrics.infection - firstMetrics.infection,
      improved: lastMetrics.infection < firstMetrics.infection
    },
    healing: {
      before: firstMetrics.healing,
      after: lastMetrics.healing,
      change: lastMetrics.healing - firstMetrics.healing,
      improved: lastMetrics.healing > firstMetrics.healing
    }
  };
  
  // 计算总体改善分数
  const improvementScore = 
    (firstMetrics.redness - lastMetrics.redness) +
    (firstMetrics.swelling - lastMetrics.swelling) +
    (firstMetrics.infection - lastMetrics.infection) +
    (lastMetrics.healing - firstMetrics.healing);
  
  // 评估等级
  let assessmentLevel;
  if (improvementScore > 30) {
    assessmentLevel = { level: 'great', text: '恢复良好', icon: '🎉' };
  } else if (improvementScore > 0) {
    assessmentLevel = { level: 'good', text: '稳步恢复', icon: '👍' };
  } else if (improvementScore === 0) {
    assessmentLevel = { level: 'stable', text: '状态稳定', icon: '😐' };
  } else if (improvementScore > -30) {
    assessmentLevel = { level: 'attention', text: '需要关注', icon: '⚠️' };
  } else {
    assessmentLevel = { level: 'warning', text: '需要处理', icon: '⚠️' };
  }
  
  return {
    metrics: metricsComparison,
    improvementScore,
    assessmentLevel,
    scoreChange: (last.score || 0) - (first.score || 0),
    suggestions: this.generateComparisonSuggestions(metricsComparison, assessmentLevel)
  };
}

/**
 * 基于NPUAP分期计算健康指标
 */
static getHealthMetricsFromStage(pressureStage) {
  const metricsMap = {
    'normal': { redness: 0, swelling: 0, infection: 5, healing: 100 },
    'stage_1': { redness: 40, swelling: 20, infection: 20, healing: 75 },
    'stage-1': { redness: 40, swelling: 20, infection: 20, healing: 75 },
    'stage_2': { redness: 60, swelling: 40, infection: 40, healing: 60 },
    'stage-2': { redness: 60, swelling: 40, infection: 40, healing: 60 },
    'stage_3': { redness: 80, swelling: 60, infection: 70, healing: 40 },
    'stage-3': { redness: 80, swelling: 60, infection: 70, healing: 40 },
    'stage_4': { redness: 95, swelling: 80, infection: 90, healing: 20 },
    'stage-4': { redness: 95, swelling: 80, infection: 90, healing: 20 },
    'dtpi': { redness: 70, swelling: 50, infection: 60, healing: 45 },
    'unstageable': { redness: 50, swelling: 50, infection: 85, healing: 15 },
    'low': { redness: 10, swelling: 5, infection: 10, healing: 90 },
    'medium': { redness: 50, swelling: 30, infection: 50, healing: 60 },
    'high': { redness: 80, swelling: 60, infection: 80, healing: 30 }
  };
  return metricsMap[pressureStage] || metricsMap['normal'];
}

/**
 * 生成对比建议
 */
static generateComparisonSuggestions(metrics, assessmentLevel) {
  const suggestions = [];
  
  if (metrics.redness.change > 10) {
    suggestions.push('红肿程度增加，建议保持造口清洁，避免摩擦');
  }
  
  if (metrics.infection.change > 10) {
    suggestions.push('感染风险上升，请及时联系护士进行专业评估');
  }
  
  if (metrics.healing.change > 10) {
    suggestions.push('愈合情况良好，请继续保持当前护理方案');
  }
  
  if (assessmentLevel.level === 'great') {
    suggestions.push('恢复效果显著，继续保持积极的护理态度');
  }
  
  if (assessmentLevel.level === 'warning') {
    suggestions.push('状况下降明显，建议尽快联系医护人员');
  }
  
  return suggestions;
}

/**
 * 计算时间跨度
 */
static calculateTimeSpan(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = Math.abs(end - start);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return {
    days: diffDays,
    hours: diffHours,
    text: diffDays > 0 ? `${diffDays}天${diffHours > 0 ? diffHours + '小时' : ''}` : `${diffHours}小时`
  };
}

/**
 * 获取趋势数据（按时间段）
 * GET /api/assessments/trend?days=7
 */
static async getTrend(req, res, next) {
  try {
    const patientId = req.user.patientId || req.query.patientId;
    const days = parseInt(req.query.days) || 7;
    
    if (!patientId) {
      return response.error(res, '缺少患者ID');
    }
    
    // 计算日期范围
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // 获取评估记录
    const assessments = await Assessment.findAll({
      patientId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      limit: 1000, // 足够大以获取所有记录
      offset: 0
    });
    
    // 计算趋势数据
    const trendData = {
      period: { days, startDate, endDate },
      assessmentCount: assessments.length,
      averageScore: assessments.length > 0 
        ? Math.round(assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length)
        : 0,
      data: assessments.map(a => ({
        date: a.createdAt,
        score: a.score,
        riskLevel: a.riskLevel,
        pressureStage: a.pressureStage
      }))
    };
    
    // 如果有多条记录，计算改善幅度
    if (assessments.length >= 2) {
      const sorted = [...assessments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      trendData.improvement = {
        scoreChange: (last.score || 0) - (first.score || 0),
        timeSpan: this.calculateTimeSpan(first.createdAt, last.createdAt)
      };
    }
    
    return response.success(res, trendData);
  } catch (error) {
    next(error);
  }
}

// 导出新方法
module.exports = {
  compareAssessments,
  getTrend,
  calculateComparison,
  getHealthMetricsFromStage,
  generateComparisonSuggestions,
  calculateTimeSpan
};

