const db = require('../config/database');

class Assessment {
  // 创建评估记录（DET评分系统）
  static async create(assessmentData) {
    const sql = `
      INSERT INTO assessments (
        patient_id, image_url, assessment_date,
        stoma_color, stoma_size, stoma_shape, skin_condition,
        det_d_area, det_d_severity, det_d_total,
        det_e_area, det_e_severity, det_e_total,
        det_t_area, det_t_severity, det_t_total,
        det_total, det_level, score,
        ai_confidence, issues, detailed_analysis, suggestions,
        metric_discoloration, metric_erosion, metric_tissue_growth, metric_overall,
        ai_result
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // 提取DET评分
    const detScore = assessmentData.detScore || {};
    
    const params = [
      assessmentData.patientId,
      assessmentData.imageUrl,
      assessmentData.assessmentDate || new Date(),
      
      // 造口基本信息
      assessmentData.stomaColor || null,
      assessmentData.stomaSize || null,
      assessmentData.stomaShape || null,
      assessmentData.skinCondition || null,
      
      // DET评分详细信息
      detScore.d_discoloration_area || 0,
      detScore.d_discoloration_severity || 0,
      detScore.d_total || 0,
      detScore.e_erosion_area || 0,
      detScore.e_erosion_severity || 0,
      detScore.e_total || 0,
      detScore.t_tissue_area || 0,
      detScore.t_tissue_severity || 0,
      detScore.t_total || 0,
      detScore.total || 0,
      assessmentData.detLevel || 'excellent',
      detScore.total || 0,  // score字段存储DET总分(0-15)
      
      // AI分析结果
      assessmentData.confidence || 0.85,
      JSON.stringify(assessmentData.issues || []),
      assessmentData.detailedAnalysis || null,
      assessmentData.suggestions || null,
      
      // 健康指标
      (assessmentData.healthMetrics && assessmentData.healthMetrics.discoloration) || 0,
      (assessmentData.healthMetrics && assessmentData.healthMetrics.erosion) || 0,
      (assessmentData.healthMetrics && assessmentData.healthMetrics.tissueGrowth) || 0,
      (assessmentData.healthMetrics && assessmentData.healthMetrics.overall) || 100,
      
      // 原始AI结果
      JSON.stringify(assessmentData.aiResult || {})
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据ID查找评估
  static async findById(id) {
    const sql = `
      SELECT a.*, p.name as patient_name, p.gender as patient_gender, p.phone as patient_phone
      FROM assessments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `;
    const results = await db.query(sql, [id]);
    
    if (results.length > 0) {
      return this.formatAssessment(results[0]);
    }
    return null;
  }

  // 获取患者的评估列表
  static async findByPatientId(patientId, options = {}) {
    let sql = `
      SELECT a.*
      FROM assessments a
      WHERE a.patient_id = ?
      ORDER BY a.assessment_date DESC
    `;
    const params = [patientId];
    
    if (options.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(options.limit), parseInt(options.offset || 0));
    }
    
    const results = await db.query(sql, params);
    return results.map(assessment => this.formatAssessment(assessment));
  }

  // 获取评估列表（支持筛选）
  static async findAll(filters = {}) {
    let sql = `
      SELECT a.*, p.name as patient_name, p.gender as patient_gender, p.phone as patient_phone
      FROM assessments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.patientId) {
      sql += ' AND a.patient_id = ?';
      params.push(filters.patientId);
    }
    
    if (filters.detLevel) {
      sql += ' AND a.det_level = ?';
      params.push(filters.detLevel);
    }
    
    if (filters.detTotalMin !== undefined) {
      sql += ' AND a.det_total >= ?';
      params.push(filters.detTotalMin);
    }
    
    if (filters.detTotalMax !== undefined) {
      sql += ' AND a.det_total <= ?';
      params.push(filters.detTotalMax);
    }
    
    if (filters.nurseReview !== undefined) {
      sql += ' AND a.nurse_review = ?';
      params.push(filters.nurseReview);
    }
    
    if (filters.startDate) {
      sql += ' AND DATE(a.assessment_date) >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      sql += ' AND DATE(a.assessment_date) <= ?';
      params.push(filters.endDate);
    }
    
    sql += ' ORDER BY a.assessment_date DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }
    
    const results = await db.query(sql, params);
    return results.map(assessment => this.formatAssessment(assessment));
  }

  // 护士审阅评估
  static async nurseReview(id, reviewData) {
    const sql = `
      UPDATE assessments
      SET nurse_review = 1, nurse_comment = ?, reviewed_at = NOW()
      WHERE id = ?
    `;
    const params = [reviewData.comment || null, id];
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 更新评估
  static async update(id, assessmentData) {
    const fields = [];
    const params = [];
    
    if (assessmentData.stomaColor !== undefined) {
      fields.push('stoma_color = ?');
      params.push(assessmentData.stomaColor);
    }
    if (assessmentData.stomaSize !== undefined) {
      fields.push('stoma_size = ?');
      params.push(assessmentData.stomaSize);
    }
    if (assessmentData.stomaShape !== undefined) {
      fields.push('stoma_shape = ?');
      params.push(assessmentData.stomaShape);
    }
    if (assessmentData.skinCondition !== undefined) {
      fields.push('skin_condition = ?');
      params.push(assessmentData.skinCondition);
    }
    if (assessmentData.detLevel !== undefined) {
      fields.push('det_level = ?');
      params.push(assessmentData.detLevel);
    }
    if (assessmentData.suggestions !== undefined) {
      fields.push('suggestions = ?');
      params.push(assessmentData.suggestions);
    }
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE assessments SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除评估
  static async delete(id) {
    const sql = 'DELETE FROM assessments WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 统计评估数量
  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM assessments WHERE 1=1';
    const params = [];
    
    if (filters.patientId) {
      sql += ' AND patient_id = ?';
      params.push(filters.patientId);
    }
    
    if (filters.detLevel) {
      sql += ' AND det_level = ?';
      params.push(filters.detLevel);
    }
    
    const results = await db.query(sql, params);
    return results[0].total;
  }

  // 获取最近的评估
  static async getLatest(patientId) {
    const sql = `
      SELECT * FROM assessments
      WHERE patient_id = ?
      ORDER BY assessment_date DESC
      LIMIT 1
    `;
    const results = await db.query(sql, [patientId]);
    
    if (results.length > 0) {
      return this.formatAssessment(results[0]);
    }
    return null;
  }
  
  // 获取DET评分统计
  static async getDetStatistics(patientId, days = 30) {
    const sql = `
      SELECT 
        DATE(assessment_date) as date,
        AVG(det_total) as avg_det_total,
        AVG(det_d_total) as avg_d_total,
        AVG(det_e_total) as avg_e_total,
        AVG(det_t_total) as avg_t_total,
        AVG(score) as avg_score,
        COUNT(*) as count
      FROM assessments
      WHERE patient_id = ? 
        AND assessment_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(assessment_date)
      ORDER BY date DESC
    `;
    
    return await db.query(sql, [patientId, days]);
  }
  
  // 格式化评估数据（解析JSON字段）
  static formatAssessment(assessment) {
    // 解析JSON字段
    if (assessment.issues && typeof assessment.issues === 'string') {
      try {
        assessment.issues = JSON.parse(assessment.issues);
      } catch (e) {
        assessment.issues = [];
      }
    }
    
    if (assessment.ai_result && typeof assessment.ai_result === 'string') {
      try {
        assessment.ai_result = JSON.parse(assessment.ai_result);
      } catch (e) {
        assessment.ai_result = {};
      }
    }
    
    // 构建DET评分对象
    assessment.detScore = {
      d_discoloration_area: assessment.det_d_area || 0,
      d_discoloration_severity: assessment.det_d_severity || 0,
      d_total: assessment.det_d_total || 0,
      e_erosion_area: assessment.det_e_area || 0,
      e_erosion_severity: assessment.det_e_severity || 0,
      e_total: assessment.det_e_total || 0,
      t_tissue_area: assessment.det_t_area || 0,
      t_tissue_severity: assessment.det_t_severity || 0,
      t_total: assessment.det_t_total || 0,
      total: assessment.det_total || 0
    };
    
    // 构建健康指标对象
    assessment.healthMetrics = {
      discoloration: assessment.metric_discoloration || 0,
      erosion: assessment.metric_erosion || 0,
      tissueGrowth: assessment.metric_tissue_growth || 0,
      overall: assessment.metric_overall || 100
    };
    
    // 转换字段名为前端期望的格式（camelCase）
    assessment.patientId = assessment.patient_id;
    assessment.imageUrl = assessment.image_url;
    assessment.assessmentDate = assessment.assessment_date;
    assessment.stomaColor = assessment.stoma_color;
    assessment.stomaSize = assessment.stoma_size;
    assessment.stomaShape = assessment.stoma_shape;
    assessment.skinCondition = assessment.skin_condition;
    assessment.detLevel = assessment.det_level;
    assessment.detLevelText = this.getDetLevelText(assessment.det_level);
    assessment.aiConfidence = assessment.ai_confidence;
    assessment.detailedAnalysis = assessment.detailed_analysis;
    assessment.nurseReview = assessment.nurse_review;
    assessment.nurseComment = assessment.nurse_comment;
    assessment.reviewedAt = assessment.reviewed_at;
    assessment.createdAt = assessment.created_at;
    assessment.updatedAt = assessment.updated_at;
    
    // 兼容旧字段名
    assessment.riskLevel = assessment.det_level;
    assessment.confidence = assessment.ai_confidence;
    
    return assessment;
  }
  
  // 获取DET等级文本
  static getDetLevelText(detLevel) {
    const levelMap = {
      'excellent': '优秀（无皮炎）',
      'good': '良好（轻度皮炎）',
      'moderate': '中度（中度皮炎）',
      'poor': '较差（重度皮炎）',
      'critical': '严重（极重度皮炎）'
    };
    return levelMap[detLevel] || '未知';
  }
}

module.exports = Assessment;
