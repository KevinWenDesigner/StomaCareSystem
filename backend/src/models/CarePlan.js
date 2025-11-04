const db = require('../config/database');

class CarePlan {
  // 创建护理计划
  static async create(planData) {
    const sql = `
      INSERT INTO care_plans (patient_id, nurse_id, title, description,
        start_date, end_date, frequency, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      planData.patientId,
      planData.nurseId || null,
      planData.title,
      planData.description || null,
      planData.startDate,
      planData.endDate || null,
      planData.frequency || null,
      planData.status || 'active',
      planData.notes || null
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据ID查找
  static async findById(id) {
    const sql = `
      SELECT cp.*, p.name as patient_name, n.name as nurse_name
      FROM care_plans cp
      LEFT JOIN patients p ON cp.patient_id = p.id
      LEFT JOIN nurses n ON cp.nurse_id = n.id
      WHERE cp.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  // 获取护理计划列表
  static async findAll(filters = {}) {
    let sql = `
      SELECT cp.*, p.name as patient_name, n.name as nurse_name
      FROM care_plans cp
      LEFT JOIN patients p ON cp.patient_id = p.id
      LEFT JOIN nurses n ON cp.nurse_id = n.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.patientId) {
      sql += ' AND cp.patient_id = ?';
      params.push(filters.patientId);
    }
    
    if (filters.nurseId) {
      sql += ' AND cp.nurse_id = ?';
      params.push(filters.nurseId);
    }
    
    if (filters.status) {
      sql += ' AND cp.status = ?';
      params.push(filters.status);
    }
    
    sql += ' ORDER BY cp.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }
    
    const results = await db.query(sql, params);
    return results;
  }

  // 更新护理计划
  static async update(id, planData) {
    const fields = [];
    const params = [];
    
    const allowedFields = [
      'title', 'description', 'startDate', 'endDate', 'frequency', 'status', 'notes'
    ];
    
    const fieldMap = {
      startDate: 'start_date',
      endDate: 'end_date'
    };
    
    allowedFields.forEach(field => {
      if (planData[field] !== undefined) {
        const dbField = fieldMap[field] || field;
        fields.push(`${dbField} = ?`);
        params.push(planData[field]);
      }
    });
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE care_plans SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除护理计划
  static async delete(id) {
    const sql = 'DELETE FROM care_plans WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 添加计划项目
  static async addItem(itemData) {
    const sql = `
      INSERT INTO care_plan_items (plan_id, title, description, target_value, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      itemData.planId,
      itemData.title,
      itemData.description || null,
      itemData.targetValue || null,
      itemData.sortOrder || 0
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 获取计划项目
  static async getItems(planId) {
    const sql = `
      SELECT * FROM care_plan_items
      WHERE plan_id = ?
      ORDER BY sort_order ASC, id ASC
    `;
    const results = await db.query(sql, [planId]);
    return results;
  }

  // 更新项目状态
  static async updateItemStatus(itemId, completed) {
    const sql = `
      UPDATE care_plan_items
      SET completed = ?, completed_at = ${completed ? 'NOW()' : 'NULL'}
      WHERE id = ?
    `;
    const result = await db.query(sql, [completed, itemId]);
    return result.affectedRows > 0;
  }

  // 删除项目
  static async deleteItem(itemId) {
    const sql = 'DELETE FROM care_plan_items WHERE id = ?';
    const result = await db.query(sql, [itemId]);
    return result.affectedRows > 0;
  }
}

module.exports = CarePlan;




