const db = require('../config/database');

class Assessment {
  // 创建评估记录
  static async create(assessmentData) {
    const sql = `
      INSERT INTO assessments (patient_id, image_url, assessment_date, ai_result,
        stoma_color, stoma_size, skin_condition, risk_level, suggestions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      assessmentData.patientId,
      assessmentData.imageUrl,
      assessmentData.assessmentDate || new Date(),
      JSON.stringify(assessmentData.aiResult || {}),
      assessmentData.stomaColor || null,
      assessmentData.stomaSize || null,
      assessmentData.skinCondition || null,
      assessmentData.riskLevel || null,
      assessmentData.suggestions || null
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据ID查找评估
  static async findById(id) {
    const sql = `
      SELECT a.*, p.name as patient_name, p.gender as patient_gender
      FROM assessments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `;
    const results = await db.query(sql, [id]);
    
    if (results.length > 0) {
      const assessment = results[0];
      // 解析JSON字段
      if (assessment.ai_result) {
        try {
          assessment.ai_result = JSON.parse(assessment.ai_result);
        } catch (e) {
          assessment.ai_result = {};
        }
      }
      return assessment;
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
    
    // 解析JSON字段
    return results.map(assessment => {
      if (assessment.ai_result) {
        try {
          assessment.ai_result = JSON.parse(assessment.ai_result);
        } catch (e) {
          assessment.ai_result = {};
        }
      }
      return assessment;
    });
  }

  // 获取评估列表（支持筛选）
  static async findAll(filters = {}) {
    let sql = `
      SELECT a.*, p.name as patient_name, p.gender as patient_gender
      FROM assessments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.patientId) {
      sql += ' AND a.patient_id = ?';
      params.push(filters.patientId);
    }
    
    if (filters.riskLevel) {
      sql += ' AND a.risk_level = ?';
      params.push(filters.riskLevel);
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
    
    // 解析JSON字段
    return results.map(assessment => {
      if (assessment.ai_result) {
        try {
          assessment.ai_result = JSON.parse(assessment.ai_result);
        } catch (e) {
          assessment.ai_result = {};
        }
      }
      return assessment;
    });
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
    if (assessmentData.skinCondition !== undefined) {
      fields.push('skin_condition = ?');
      params.push(assessmentData.skinCondition);
    }
    if (assessmentData.riskLevel !== undefined) {
      fields.push('risk_level = ?');
      params.push(assessmentData.riskLevel);
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
    
    if (filters.riskLevel) {
      sql += ' AND risk_level = ?';
      params.push(filters.riskLevel);
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
      const assessment = results[0];
      if (assessment.ai_result) {
        try {
          assessment.ai_result = JSON.parse(assessment.ai_result);
        } catch (e) {
          assessment.ai_result = {};
        }
      }
      return assessment;
    }
    return null;
  }
}

module.exports = Assessment;




