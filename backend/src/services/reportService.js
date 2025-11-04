const Assessment = require('../models/Assessment');
const SymptomDiary = require('../models/SymptomDiary');
const { getRecentDays, formatDate } = require('../utils/date');

class ReportService {
  // 生成健康报告
  static async generateHealthReport(patientId, days = 30) {
    try {
      const dateRange = getRecentDays(days);
      
      // 获取评估数据
      const assessments = await Assessment.findByPatientId(patientId, {
        limit: 100
      });
      
      // 获取症状日记数据
      const diaries = await SymptomDiary.findByPatientId(patientId, {
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      // 统计数据
      const stats = await this.calculateStats(patientId, assessments, diaries);
      
      // 趋势分析
      const trends = this.analyzeTrends(assessments, diaries);
      
      // 健康评分
      const healthScore = this.calculateHealthScore(stats, trends);
      
      // 生成建议
      const recommendations = this.generateRecommendations(stats, trends, healthScore);
      
      return {
        period: {
          start: dateRange.start,
          end: dateRange.end,
          days
        },
        healthScore,
        stats,
        trends,
        recommendations,
        assessmentCount: assessments.length,
        diaryCount: diaries.length
      };
    } catch (error) {
      console.error('生成健康报告错误:', error);
      throw error;
    }
  }

  // 计算统计数据
  static async calculateStats(patientId, assessments, diaries) {
    // 评估统计
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0
    };
    
    assessments.forEach(assessment => {
      if (assessment.risk_level) {
        riskDistribution[assessment.risk_level]++;
      }
    });
    
    // 症状统计
    let totalPainLevel = 0;
    let totalOdorLevel = 0;
    let totalLeaks = 0;
    let totalBagChanges = 0;
    let painRecords = 0;
    let odorRecords = 0;
    
    diaries.forEach(diary => {
      if (diary.pain_level !== null) {
        totalPainLevel += diary.pain_level;
        painRecords++;
      }
      if (diary.odor_level !== null) {
        totalOdorLevel += diary.odor_level;
        odorRecords++;
      }
      totalLeaks += diary.leak_incident || 0;
      totalBagChanges += diary.bag_change_count || 0;
    });
    
    return {
      assessmentStats: {
        total: assessments.length,
        riskDistribution
      },
      symptomStats: {
        avgPainLevel: painRecords > 0 ? (totalPainLevel / painRecords).toFixed(1) : 0,
        avgOdorLevel: odorRecords > 0 ? (totalOdorLevel / odorRecords).toFixed(1) : 0,
        totalLeaks,
        avgBagChanges: diaries.length > 0 ? (totalBagChanges / diaries.length).toFixed(1) : 0,
        recordDays: diaries.length
      }
    };
  }

  // 趋势分析
  static analyzeTrends(assessments, diaries) {
    const trends = {
      riskTrend: 'stable',
      painTrend: 'stable',
      leakTrend: 'stable',
      overallTrend: 'stable'
    };
    
    // 风险趋势
    if (assessments.length >= 2) {
      const riskLevelMap = { low: 1, medium: 2, high: 3 };
      const recentRisks = assessments.slice(0, 3).map(a => riskLevelMap[a.risk_level] || 1);
      const avgRecentRisk = recentRisks.reduce((a, b) => a + b, 0) / recentRisks.length;
      
      const olderRisks = assessments.slice(3, 6).map(a => riskLevelMap[a.risk_level] || 1);
      if (olderRisks.length > 0) {
        const avgOlderRisk = olderRisks.reduce((a, b) => a + b, 0) / olderRisks.length;
        
        if (avgRecentRisk > avgOlderRisk + 0.3) {
          trends.riskTrend = 'worsening';
        } else if (avgRecentRisk < avgOlderRisk - 0.3) {
          trends.riskTrend = 'improving';
        }
      }
    }
    
    // 疼痛趋势
    if (diaries.length >= 7) {
      const recentPain = diaries.slice(0, 7)
        .filter(d => d.pain_level !== null)
        .map(d => d.pain_level);
      const olderPain = diaries.slice(7, 14)
        .filter(d => d.pain_level !== null)
        .map(d => d.pain_level);
      
      if (recentPain.length > 0 && olderPain.length > 0) {
        const avgRecentPain = recentPain.reduce((a, b) => a + b, 0) / recentPain.length;
        const avgOlderPain = olderPain.reduce((a, b) => a + b, 0) / olderPain.length;
        
        if (avgRecentPain > avgOlderPain + 1) {
          trends.painTrend = 'worsening';
        } else if (avgRecentPain < avgOlderPain - 1) {
          trends.painTrend = 'improving';
        }
      }
    }
    
    // 渗漏趋势
    const recentLeaks = diaries.slice(0, 7).reduce((sum, d) => sum + (d.leak_incident || 0), 0);
    const olderLeaks = diaries.slice(7, 14).reduce((sum, d) => sum + (d.leak_incident || 0), 0);
    
    if (recentLeaks > olderLeaks) {
      trends.leakTrend = 'worsening';
    } else if (recentLeaks < olderLeaks && recentLeaks === 0) {
      trends.leakTrend = 'improving';
    }
    
    // 总体趋势
    const worseningCount = Object.values(trends).filter(t => t === 'worsening').length;
    const improvingCount = Object.values(trends).filter(t => t === 'improving').length;
    
    if (worseningCount > improvingCount) {
      trends.overallTrend = 'worsening';
    } else if (improvingCount > worseningCount) {
      trends.overallTrend = 'improving';
    }
    
    return trends;
  }

  // 计算健康评分 (0-100)
  static calculateHealthScore(stats, trends) {
    let score = 100;
    
    // 根据风险分布扣分
    const { riskDistribution } = stats.assessmentStats;
    const total = riskDistribution.low + riskDistribution.medium + riskDistribution.high;
    
    if (total > 0) {
      const highRiskRatio = riskDistribution.high / total;
      const mediumRiskRatio = riskDistribution.medium / total;
      
      score -= highRiskRatio * 30;
      score -= mediumRiskRatio * 15;
    }
    
    // 根据症状扣分
    const { avgPainLevel, avgOdorLevel, totalLeaks } = stats.symptomStats;
    score -= avgPainLevel * 2;
    score -= avgOdorLevel * 1.5;
    score -= totalLeaks * 3;
    
    // 根据趋势调整
    if (trends.overallTrend === 'worsening') {
      score -= 10;
    } else if (trends.overallTrend === 'improving') {
      score += 5;
    }
    
    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, score));
    
    return Math.round(score);
  }

  // 生成建议
  static generateRecommendations(stats, trends, healthScore) {
    const recommendations = [];
    
    // 基于健康评分
    if (healthScore >= 80) {
      recommendations.push({
        type: 'positive',
        title: '整体状况良好',
        content: '您的造口护理做得很好，请继续保持！'
      });
    } else if (healthScore >= 60) {
      recommendations.push({
        type: 'warning',
        title: '需要注意',
        content: '您的造口状况尚可，但仍需加强日常护理。'
      });
    } else {
      recommendations.push({
        type: 'danger',
        title: '需要改善',
        content: '建议尽快联系护士，进行专业评估和指导。'
      });
    }
    
    // 基于风险趋势
    if (trends.riskTrend === 'worsening') {
      recommendations.push({
        type: 'danger',
        title: '风险上升',
        content: '最近的评估显示风险有上升趋势，请加强观察并联系护士。'
      });
    } else if (trends.riskTrend === 'improving') {
      recommendations.push({
        type: 'positive',
        title: '持续改善',
        content: '造口状况持续改善，说明您的护理方法很有效！'
      });
    }
    
    // 基于症状
    const { avgPainLevel, totalLeaks } = stats.symptomStats;
    
    if (avgPainLevel > 3) {
      recommendations.push({
        type: 'warning',
        title: '疼痛管理',
        content: '最近疼痛水平较高，建议检查造口袋是否过紧，必要时咨询护士。'
      });
    }
    
    if (totalLeaks > 2) {
      recommendations.push({
        type: 'warning',
        title: '预防渗漏',
        content: '渗漏次数较多，建议检查造口袋尺寸是否合适，粘贴是否牢固。'
      });
    }
    
    // 记录建议
    if (stats.symptomStats.recordDays < 15) {
      recommendations.push({
        type: 'info',
        title: '坚持记录',
        content: '建议每天记录症状日记，这有助于更好地了解您的健康状况。'
      });
    }
    
    return recommendations;
  }
}

module.exports = ReportService;




