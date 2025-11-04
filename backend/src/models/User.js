const db = require('../config/database');

class User {
  // 创建用户
  static async create(userData) {
    const sql = `
      INSERT INTO users (openid, union_id, session_key, nickname, avatar_url, gender, phone, user_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.openid,
      userData.unionId || null,
      userData.sessionKey || null,
      userData.nickname || null,
      userData.avatarUrl || null,
      userData.gender || 0,
      userData.phone || null,
      userData.userType || 'patient'
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据openid查找用户
  static async findByOpenid(openid) {
    const sql = 'SELECT * FROM users WHERE openid = ?';
    const results = await db.query(sql, [openid]);
    return results[0] || null;
  }

  // 根据ID查找用户
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  // 更新用户信息
  static async update(id, userData) {
    const fields = [];
    const params = [];
    
    if (userData.nickname !== undefined) {
      fields.push('nickname = ?');
      params.push(userData.nickname);
    }
    if (userData.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      params.push(userData.avatarUrl);
    }
    if (userData.gender !== undefined) {
      fields.push('gender = ?');
      params.push(userData.gender);
    }
    if (userData.phone !== undefined) {
      fields.push('phone = ?');
      params.push(userData.phone);
    }
    if (userData.sessionKey !== undefined) {
      fields.push('session_key = ?');
      params.push(userData.sessionKey);
    }
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除用户
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;




