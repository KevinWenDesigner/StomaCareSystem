const db = require('../config/database');

class Course {
  // 创建课程
  static async create(courseData) {
    const sql = `
      INSERT INTO courses (category_id, title, cover_image, description, content,
        video_url, duration, difficulty, sort_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      courseData.categoryId,
      courseData.title,
      courseData.coverImage || null,
      courseData.description || null,
      courseData.content || null,
      courseData.videoUrl || null,
      courseData.duration || null,
      courseData.difficulty || 'beginner',
      courseData.sortOrder || 0,
      courseData.status || 'active'
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 根据ID查找课程
  static async findById(id) {
    const sql = `
      SELECT c.*, cc.name as category_name
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  // 获取课程列表
  static async findAll(filters = {}) {
    let sql = `
      SELECT c.*, cc.name as category_name
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.categoryId) {
      sql += ' AND c.category_id = ?';
      params.push(filters.categoryId);
    }
    
    if (filters.difficulty) {
      sql += ' AND c.difficulty = ?';
      params.push(filters.difficulty);
    }
    
    if (filters.status) {
      sql += ' AND c.status = ?';
      params.push(filters.status);
    } else {
      sql += ' AND c.status = "active"';
    }
    
    if (filters.keyword) {
      sql += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword);
    }
    
    sql += ' ORDER BY c.sort_order ASC, c.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }
    
    const results = await db.query(sql, params);
    return results;
  }

  // 更新课程
  static async update(id, courseData) {
    const fields = [];
    const params = [];
    
    const allowedFields = [
      'categoryId', 'title', 'coverImage', 'description', 'content',
      'videoUrl', 'duration', 'difficulty', 'sortOrder', 'status'
    ];
    
    const fieldMap = {
      categoryId: 'category_id',
      coverImage: 'cover_image',
      videoUrl: 'video_url',
      sortOrder: 'sort_order'
    };
    
    allowedFields.forEach(field => {
      if (courseData[field] !== undefined) {
        const dbField = fieldMap[field] || field;
        fields.push(`${dbField} = ?`);
        params.push(courseData[field]);
      }
    });
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 增加浏览次数
  static async incrementViewCount(id) {
    const sql = 'UPDATE courses SET view_count = view_count + 1 WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 增加点赞数
  static async incrementLikeCount(id) {
    const sql = 'UPDATE courses SET like_count = like_count + 1 WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 删除课程
  static async delete(id) {
    const sql = 'DELETE FROM courses WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 统计课程数量
  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM courses WHERE 1=1';
    const params = [];
    
    if (filters.categoryId) {
      sql += ' AND category_id = ?';
      params.push(filters.categoryId);
    }
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    const results = await db.query(sql, params);
    return results[0].total;
  }

  // 获取课程分类
  static async getCategories() {
    const sql = `
      SELECT * FROM course_categories
      WHERE status = 'active'
      ORDER BY sort_order ASC
    `;
    const results = await db.query(sql);
    return results;
  }
}

module.exports = Course;




