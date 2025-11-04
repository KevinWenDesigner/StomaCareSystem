const db = require('../config/database');

class SymptomDiary {
  // 创建症状日记
  static async create(diaryData) {
    const sql = `
      INSERT INTO symptom_diaries (patient_id, diary_date, output_volume, output_type,
        output_color, skin_condition, pain_level, odor_level, leak_incident,
        bag_change_count, diet_notes, mood, notes, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      diaryData.patientId,
      diaryData.diaryDate,
      diaryData.outputVolume || null,
      diaryData.outputType || null,
      diaryData.outputColor || null,
      diaryData.skinCondition || null,
      diaryData.painLevel || null,
      diaryData.odorLevel || null,
      diaryData.leakIncident || 0,
      diaryData.bagChangeCount || 0,
      diaryData.dietNotes || null,
      diaryData.mood || null,
      diaryData.notes || null,
      JSON.stringify(diaryData.images || [])
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据ID查找日记
  static async findById(id) {
    const sql = 'SELECT * FROM symptom_diaries WHERE id = ?';
    const results = await db.query(sql, [id]);
    
    if (results.length > 0) {
      const diary = results[0];
      // 解析JSON字段
      if (diary.images) {
        try {
          diary.images = JSON.parse(diary.images);
        } catch (e) {
          diary.images = [];
        }
      }
      return diary;
    }
    return null;
  }

  // 根据患者ID和日期查找
  static async findByPatientAndDate(patientId, date) {
    const sql = `
      SELECT * FROM symptom_diaries
      WHERE patient_id = ? AND diary_date = ?
    `;
    const results = await db.query(sql, [patientId, date]);
    
    if (results.length > 0) {
      const diary = results[0];
      if (diary.images) {
        try {
          diary.images = JSON.parse(diary.images);
        } catch (e) {
          diary.images = [];
        }
      }
      return diary;
    }
    return null;
  }

  // 获取患者的日记列表
  static async findByPatientId(patientId, options = {}) {
    let sql = `
      SELECT * FROM symptom_diaries
      WHERE patient_id = ?
    `;
    const params = [patientId];
    
    if (options.startDate) {
      sql += ' AND diary_date >= ?';
      params.push(options.startDate);
    }
    
    if (options.endDate) {
      sql += ' AND diary_date <= ?';
      params.push(options.endDate);
    }
    
    sql += ' ORDER BY diary_date DESC';
    
    if (options.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(options.limit), parseInt(options.offset || 0));
    }
    
    const results = await db.query(sql, params);
    
    // 解析JSON字段
    return results.map(diary => {
      if (diary.images) {
        try {
          diary.images = JSON.parse(diary.images);
        } catch (e) {
          diary.images = [];
        }
      }
      return diary;
    });
  }

  // 更新日记
  static async update(id, diaryData) {
    const fields = [];
    const params = [];
    
    const allowedFields = [
      'outputVolume', 'outputType', 'outputColor', 'skinCondition',
      'painLevel', 'odorLevel', 'leakIncident', 'bagChangeCount',
      'dietNotes', 'mood', 'notes', 'images'
    ];
    
    const fieldMap = {
      outputVolume: 'output_volume',
      outputType: 'output_type',
      outputColor: 'output_color',
      skinCondition: 'skin_condition',
      painLevel: 'pain_level',
      odorLevel: 'odor_level',
      leakIncident: 'leak_incident',
      bagChangeCount: 'bag_change_count',
      dietNotes: 'diet_notes'
    };
    
    allowedFields.forEach(field => {
      if (diaryData[field] !== undefined) {
        const dbField = fieldMap[field] || field;
        fields.push(`${dbField} = ?`);
        
        // 处理images字段
        if (field === 'images') {
          params.push(JSON.stringify(diaryData[field]));
        } else {
          params.push(diaryData[field]);
        }
      }
    });
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE symptom_diaries SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除日记
  static async delete(id) {
    const sql = 'DELETE FROM symptom_diaries WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 统计日记数量
  static async count(patientId, filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM symptom_diaries WHERE patient_id = ?';
    const params = [patientId];
    
    if (filters.startDate) {
      sql += ' AND diary_date >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      sql += ' AND diary_date <= ?';
      params.push(filters.endDate);
    }
    
    const results = await db.query(sql, params);
    return results[0].total;
  }

  // 获取日记统计数据
  static async getStats(patientId, startDate, endDate) {
    const sql = `
      SELECT 
        COUNT(*) as total_days,
        AVG(pain_level) as avg_pain,
        AVG(odor_level) as avg_odor,
        SUM(leak_incident) as total_leaks,
        AVG(bag_change_count) as avg_bag_changes
      FROM symptom_diaries
      WHERE patient_id = ? AND diary_date BETWEEN ? AND ?
    `;
    const results = await db.query(sql, [patientId, startDate, endDate]);
    return results[0] || {};
  }
}

module.exports = SymptomDiary;




