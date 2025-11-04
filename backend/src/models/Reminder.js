const db = require('../config/database');

class Reminder {
  // 创建提醒
  static async create(reminderData) {
    const sql = `
      INSERT INTO reminders (patient_id, title, description, reminder_type,
        remind_time, frequency, remind_days, enabled, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      reminderData.patientId,
      reminderData.title,
      reminderData.description || null,
      reminderData.reminderType,
      reminderData.remindTime,
      reminderData.frequency || 'daily',
      reminderData.remindDays || null,
      reminderData.enabled !== undefined ? reminderData.enabled : 1,
      reminderData.notes || null
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据ID查找
  static async findById(id) {
    const sql = 'SELECT * FROM reminders WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  // 获取提醒列表
  static async findByPatientId(patientId, filters = {}) {
    let sql = 'SELECT * FROM reminders WHERE patient_id = ?';
    const params = [patientId];
    
    if (filters.reminderType) {
      sql += ' AND reminder_type = ?';
      params.push(filters.reminderType);
    }
    
    if (filters.enabled !== undefined) {
      sql += ' AND enabled = ?';
      params.push(filters.enabled);
    }
    
    sql += ' ORDER BY remind_time ASC';
    
    const results = await db.query(sql, params);
    return results;
  }

  // 更新提醒
  static async update(id, reminderData) {
    const fields = [];
    const params = [];
    
    const allowedFields = [
      'title', 'description', 'reminderType', 'remindTime',
      'frequency', 'remindDays', 'enabled', 'notes'
    ];
    
    const fieldMap = {
      reminderType: 'reminder_type',
      remindTime: 'remind_time',
      remindDays: 'remind_days'
    };
    
    allowedFields.forEach(field => {
      if (reminderData[field] !== undefined) {
        const dbField = fieldMap[field] || field;
        fields.push(`${dbField} = ?`);
        params.push(reminderData[field]);
      }
    });
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除提醒
  static async delete(id) {
    const sql = 'DELETE FROM reminders WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 添加提醒记录
  static async addLog(logData) {
    const sql = `
      INSERT INTO reminder_logs (reminder_id, remind_date, remind_time,
        completed, completed_at, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      logData.reminderId,
      logData.remindDate,
      logData.remindTime,
      logData.completed || 0,
      logData.completedAt || null,
      logData.notes || null
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 获取提醒记录
  static async getLogs(reminderId, filters = {}) {
    let sql = `
      SELECT * FROM reminder_logs
      WHERE reminder_id = ?
    `;
    const params = [reminderId];
    
    if (filters.startDate) {
      sql += ' AND remind_date >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      sql += ' AND remind_date <= ?';
      params.push(filters.endDate);
    }
    
    sql += ' ORDER BY remind_date DESC, remind_time DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }
    
    const results = await db.query(sql, params);
    return results;
  }

  // 更新提醒记录完成状态
  static async updateLogStatus(logId, completed, notes = null) {
    const sql = `
      UPDATE reminder_logs
      SET completed = ?, completed_at = ${completed ? 'NOW()' : 'NULL'}, notes = ?
      WHERE id = ?
    `;
    const result = await db.query(sql, [completed, notes, logId]);
    return result.affectedRows > 0;
  }

  // 获取今日提醒
  static async getTodayReminders(patientId) {
    const sql = `
      SELECT r.*, 
        (SELECT completed FROM reminder_logs 
         WHERE reminder_id = r.id AND remind_date = CURDATE() 
         LIMIT 1) as today_completed
      FROM reminders r
      WHERE r.patient_id = ? AND r.enabled = 1
      ORDER BY r.remind_time ASC
    `;
    const results = await db.query(sql, [patientId]);
    return results;
  }
}

module.exports = Reminder;




