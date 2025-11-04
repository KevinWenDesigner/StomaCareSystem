const db = require('../config/database');

class FamilyMember {
  // 创建家属
  static async create(familyData) {
    const sql = `
      INSERT INTO family_members (patient_id, name, relationship, phone, is_primary, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      familyData.patientId,
      familyData.name,
      familyData.relationship,
      familyData.phone || null,
      familyData.isPrimary || 0,
      familyData.notes || null
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据ID查找
  static async findById(id) {
    const sql = 'SELECT * FROM family_members WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  // 获取患者的家属列表
  static async findByPatientId(patientId) {
    const sql = `
      SELECT * FROM family_members
      WHERE patient_id = ?
      ORDER BY is_primary DESC, created_at ASC
    `;
    const results = await db.query(sql, [patientId]);
    return results;
  }

  // 更新家属信息
  static async update(id, familyData) {
    const fields = [];
    const params = [];
    
    const allowedFields = ['name', 'relationship', 'phone', 'isPrimary', 'notes'];
    
    const fieldMap = {
      isPrimary: 'is_primary'
    };
    
    allowedFields.forEach(field => {
      if (familyData[field] !== undefined) {
        const dbField = fieldMap[field] || field;
        fields.push(`${dbField} = ?`);
        params.push(familyData[field]);
      }
    });
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE family_members SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除家属
  static async delete(id) {
    const sql = 'DELETE FROM family_members WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 设置主要联系人
  static async setPrimary(id, patientId) {
    const connection = await db.beginTransaction();
    
    try {
      // 先取消其他主要联系人
      await connection.query(
        'UPDATE family_members SET is_primary = 0 WHERE patient_id = ?',
        [patientId]
      );
      
      // 设置新的主要联系人
      await connection.query(
        'UPDATE family_members SET is_primary = 1 WHERE id = ?',
        [id]
      );
      
      await db.commit(connection);
      return true;
    } catch (error) {
      await db.rollback(connection);
      throw error;
    }
  }
}

module.exports = FamilyMember;




