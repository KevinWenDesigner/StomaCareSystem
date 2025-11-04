const db = require('../config/database');

class Patient {
  // 创建患者信息
  static async create(patientData) {
    const sql = `
      INSERT INTO patients (user_id, name, id_card, birth_date, gender, phone, address,
        stoma_type, surgery_date, surgery_hospital, primary_disease, nurse_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      patientData.userId,
      patientData.name,
      patientData.idCard || null,
      patientData.birthDate || null,
      patientData.gender,
      patientData.phone || null,
      patientData.address || null,
      patientData.stomaType || null,
      patientData.surgeryDate || null,
      patientData.surgeryHospital || null,
      patientData.primaryDisease || null,
      patientData.nurseId || null,
      patientData.status || 'active'
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据用户ID查找患者
  static async findByUserId(userId) {
    const sql = `
      SELECT p.*, u.nickname, u.avatar_url, u.phone as user_phone
      FROM patients p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `;
    const results = await db.query(sql, [userId]);
    return results[0] || null;
  }

  // 根据ID查找患者
  static async findById(id) {
    const sql = `
      SELECT p.*, u.nickname, u.avatar_url, u.phone as user_phone,
        n.name as nurse_name, n.phone as nurse_phone
      FROM patients p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN nurses n ON p.nurse_id = n.id
      WHERE p.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  // 获取患者列表
  static async findAll(filters = {}) {
    let sql = `
      SELECT p.*, u.nickname, u.avatar_url,
        n.name as nurse_name
      FROM patients p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN nurses n ON p.nurse_id = n.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.nurseId) {
      sql += ' AND p.nurse_id = ?';
      params.push(filters.nurseId);
    }
    
    if (filters.status) {
      sql += ' AND p.status = ?';
      params.push(filters.status);
    }
    
    if (filters.keyword) {
      sql += ' AND (p.name LIKE ? OR p.phone LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword);
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }
    
    const results = await db.query(sql, params);
    return results;
  }

  // 更新患者信息
  static async update(id, patientData) {
    const fields = [];
    const params = [];
    
    const allowedFields = [
      'name', 'idCard', 'birthDate', 'gender', 'phone', 'address',
      'stomaType', 'surgeryDate', 'surgeryHospital', 'primaryDisease',
      'nurseId', 'status'
    ];
    
    const fieldMap = {
      idCard: 'id_card',
      birthDate: 'birth_date',
      stomaType: 'stoma_type',
      surgeryDate: 'surgery_date',
      surgeryHospital: 'surgery_hospital',
      primaryDisease: 'primary_disease',
      nurseId: 'nurse_id'
    };
    
    allowedFields.forEach(field => {
      if (patientData[field] !== undefined) {
        const dbField = fieldMap[field] || field;
        fields.push(`${dbField} = ?`);
        params.push(patientData[field]);
      }
    });
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除患者
  static async delete(id) {
    const sql = 'DELETE FROM patients WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 统计患者数量
  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM patients WHERE 1=1';
    const params = [];
    
    if (filters.nurseId) {
      sql += ' AND nurse_id = ?';
      params.push(filters.nurseId);
    }
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    const results = await db.query(sql, params);
    return results[0].total;
  }
}

module.exports = Patient;




