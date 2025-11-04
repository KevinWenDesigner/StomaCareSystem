const db = require('../config/database');

class LearningRecord {
  // 创建或更新学习记录
  static async createOrUpdate(recordData) {
    const sql = `
      INSERT INTO learning_records (patient_id, course_id, progress, completed,
        last_position, study_duration, last_study_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        progress = VALUES(progress),
        completed = VALUES(completed),
        last_position = VALUES(last_position),
        study_duration = study_duration + VALUES(study_duration),
        last_study_at = NOW()
    `;
    const params = [
      recordData.patientId,
      recordData.courseId,
      recordData.progress || 0,
      recordData.completed || 0,
      recordData.lastPosition || 0,
      recordData.studyDuration || 0
    ];
    
    const result = await db.query(sql, params);
    return result.insertId || result.affectedRows;
  }

  // 根据患者ID和课程ID查找
  static async findByPatientAndCourse(patientId, courseId) {
    const sql = `
      SELECT lr.*, c.title as course_title, c.duration as course_duration
      FROM learning_records lr
      LEFT JOIN courses c ON lr.course_id = c.id
      WHERE lr.patient_id = ? AND lr.course_id = ?
    `;
    const results = await db.query(sql, [patientId, courseId]);
    return results[0] || null;
  }

  // 获取患者的学习记录列表
  static async findByPatientId(patientId, filters = {}) {
    let sql = `
      SELECT lr.*, c.title, c.cover_image, c.duration, c.difficulty,
        cc.name as category_name
      FROM learning_records lr
      LEFT JOIN courses c ON lr.course_id = c.id
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE lr.patient_id = ?
    `;
    const params = [patientId];
    
    if (filters.completed !== undefined) {
      sql += ' AND lr.completed = ?';
      params.push(filters.completed);
    }
    
    sql += ' ORDER BY lr.last_study_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }
    
    const results = await db.query(sql, params);
    return results;
  }

  // 更新学习进度
  static async updateProgress(patientId, courseId, progressData) {
    const sql = `
      UPDATE learning_records
      SET progress = ?, completed = ?, last_position = ?,
          study_duration = study_duration + ?, last_study_at = NOW()
      WHERE patient_id = ? AND course_id = ?
    `;
    const params = [
      progressData.progress,
      progressData.completed || 0,
      progressData.lastPosition || 0,
      progressData.studyDuration || 0,
      patientId,
      courseId
    ];
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除学习记录
  static async delete(patientId, courseId) {
    const sql = 'DELETE FROM learning_records WHERE patient_id = ? AND course_id = ?';
    const result = await db.query(sql, [patientId, courseId]);
    return result.affectedRows > 0;
  }

  // 获取学习统计
  static async getStats(patientId) {
    const sql = `
      SELECT 
        COUNT(*) as total_courses,
        SUM(completed) as completed_courses,
        SUM(study_duration) as total_duration
      FROM learning_records
      WHERE patient_id = ?
    `;
    const results = await db.query(sql, [patientId]);
    return results[0] || {};
  }
}

module.exports = LearningRecord;




