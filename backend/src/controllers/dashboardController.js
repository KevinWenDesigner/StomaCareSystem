const db = require('../config/database');
const response = require('../utils/response');

class DashboardController {
  // 获取整体统计数据
  static async getOverallStats(req, res, next) {
    try {
      // 1. 患者统计
      const patientStats = await db.query(`
        SELECT 
          COUNT(*) as total_patients,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_patients,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_patients,
          SUM(CASE WHEN gender = '男' THEN 1 ELSE 0 END) as male_count,
          SUM(CASE WHEN gender = '女' THEN 1 ELSE 0 END) as female_count
        FROM patients
      `);

      // 2. 评估统计
      const assessmentStats = await db.query(`
        SELECT 
          COUNT(*) as total_assessments,
          COUNT(DISTINCT patient_id) as assessed_patients,
          SUM(CASE WHEN DATE(assessment_date) = CURDATE() THEN 1 ELSE 0 END) as today_assessments,
          SUM(CASE WHEN DATE(assessment_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week_assessments,
          SUM(CASE WHEN nurse_review = 1 THEN 1 ELSE 0 END) as reviewed_count,
          SUM(CASE WHEN nurse_review = 0 THEN 1 ELSE 0 END) as pending_review,
          AVG(score) as avg_score
        FROM assessments
      `);

      // 3. 风险等级分布
      const riskDistribution = await db.query(`
        SELECT 
          risk_level,
          COUNT(*) as count
        FROM assessments
        WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY risk_level
      `);

      // 4. NPUAP分期统计
      const stageDistribution = await db.query(`
        SELECT 
          pressure_stage,
          COUNT(*) as count
        FROM assessments
        WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          AND pressure_stage IS NOT NULL
        GROUP BY pressure_stage
      `);

      // 5. 症状日记统计
      const diaryStats = await db.query(`
        SELECT 
          COUNT(*) as total_diaries,
          COUNT(DISTINCT patient_id) as diary_patients,
          SUM(CASE WHEN DATE(diary_date) = CURDATE() THEN 1 ELSE 0 END) as today_diaries,
          AVG(pain_level) as avg_pain_level,
          SUM(leak_incident) as total_leaks
        FROM symptom_diaries
        WHERE diary_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `);

      // 6. 最近7天评估趋势
      const assessmentTrend = await db.query(`
        SELECT 
          DATE(assessment_date) as date,
          COUNT(*) as count,
          AVG(score) as avg_score
        FROM assessments
        WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(assessment_date)
        ORDER BY date
      `);

      // 7. 造口类型分布
      const stomaTypeDistribution = await db.query(`
        SELECT 
          stoma_type,
          COUNT(*) as count
        FROM patients
        WHERE stoma_type IS NOT NULL
        GROUP BY stoma_type
      `);

      // 8. 高风险患者列表
      const highRiskPatients = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.gender,
          p.stoma_type,
          a.risk_level,
          a.score,
          a.assessment_date,
          a.pressure_stage
        FROM patients p
        INNER JOIN assessments a ON p.id = a.patient_id
        WHERE a.id IN (
          SELECT MAX(id) FROM assessments GROUP BY patient_id
        )
        AND a.risk_level IN ('高风险', '中风险')
        ORDER BY a.assessment_date DESC
        LIMIT 10
      `);

      // 9. 待审核评估列表
      const pendingReviews = await db.query(`
        SELECT 
          a.id,
          a.patient_id,
          p.name as patient_name,
          a.assessment_date,
          a.risk_level,
          a.score
        FROM assessments a
        INNER JOIN patients p ON a.patient_id = p.id
        WHERE a.nurse_review = 0
        ORDER BY a.assessment_date DESC
        LIMIT 10
      `);

      // 10. 本月新增患者趋势
      const newPatientsTrend = await db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM patients
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
      `);

      return response.success(res, {
        patientStats: patientStats[0],
        assessmentStats: assessmentStats[0],
        riskDistribution,
        stageDistribution,
        diaryStats: diaryStats[0],
        assessmentTrend,
        stomaTypeDistribution,
        highRiskPatients,
        pendingReviews,
        newPatientsTrend,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取实时数据（用于大屏轮询）
  static async getRealTimeData(req, res, next) {
    try {
      // 今日关键指标
      const todayData = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM assessments WHERE DATE(assessment_date) = CURDATE()) as today_assessments,
          (SELECT COUNT(*) FROM symptom_diaries WHERE DATE(diary_date) = CURDATE()) as today_diaries,
          (SELECT COUNT(*) FROM patients WHERE DATE(created_at) = CURDATE()) as today_new_patients,
          (SELECT COUNT(*) FROM assessments WHERE nurse_review = 0) as pending_reviews
      `);

      // 最新5条评估
      const recentAssessments = await db.query(`
        SELECT 
          a.id,
          p.name as patient_name,
          a.assessment_date,
          a.risk_level,
          a.score,
          a.pressure_stage
        FROM assessments a
        INNER JOIN patients p ON a.patient_id = p.id
        ORDER BY a.assessment_date DESC
        LIMIT 5
      `);

      return response.success(res, {
        todayData: todayData[0],
        recentAssessments,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取患者健康趋势
  static async getHealthTrends(req, res, next) {
    try {
      const { days = 30 } = req.query;

      // 平均健康评分趋势
      const scoreTrend = await db.query(`
        SELECT 
          DATE(assessment_date) as date,
          AVG(score) as avg_score,
          COUNT(*) as assessment_count
        FROM assessments
        WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(assessment_date)
        ORDER BY date
      `, [parseInt(days)]);

      // 风险等级变化趋势
      const riskTrend = await db.query(`
        SELECT 
          DATE(assessment_date) as date,
          risk_level,
          COUNT(*) as count
        FROM assessments
        WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(assessment_date), risk_level
        ORDER BY date, risk_level
      `, [parseInt(days)]);

      // 症状趋势
      const symptomTrend = await db.query(`
        SELECT 
          DATE(diary_date) as date,
          AVG(pain_level) as avg_pain,
          AVG(odor_level) as avg_odor,
          SUM(leak_incident) as leak_count
        FROM symptom_diaries
        WHERE diary_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(diary_date)
        ORDER BY date
      `, [parseInt(days)]);

      return response.success(res, {
        scoreTrend,
        riskTrend,
        symptomTrend
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;

