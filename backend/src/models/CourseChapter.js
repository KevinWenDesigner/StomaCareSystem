const db = require('../config/database');

class CourseChapter {
  // 根据课程ID获取所有章节
  static async findByCourseId(courseId) {
    const sql = `
      SELECT * FROM course_chapters
      WHERE course_id = ? AND status = 'active'
      ORDER BY chapter_order ASC
    `;
    const results = await db.query(sql, [courseId]);
    return results;
  }

  // 根据ID获取单个章节
  static async findById(id) {
    const sql = `
      SELECT * FROM course_chapters
      WHERE id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  // 创建章节
  static async create(chapterData) {
    const sql = `
      INSERT INTO course_chapters 
      (course_id, chapter_order, title, content, video_url, duration, learning_points, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      chapterData.courseId,
      chapterData.chapterOrder,
      chapterData.title,
      chapterData.content || null,
      chapterData.videoUrl || null,
      chapterData.duration || 0,
      chapterData.learningPoints ? JSON.stringify(chapterData.learningPoints) : null,
      chapterData.status || 'active'
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  }

  // 更新章节
  static async update(id, chapterData) {
    const fields = [];
    const params = [];
    
    const allowedFields = [
      'chapterOrder', 'title', 'content', 'videoUrl', 
      'duration', 'learningPoints', 'status'
    ];
    
    const fieldMap = {
      chapterOrder: 'chapter_order',
      videoUrl: 'video_url',
      learningPoints: 'learning_points'
    };
    
    allowedFields.forEach(field => {
      if (chapterData[field] !== undefined) {
        const dbField = fieldMap[field] || field;
        fields.push(`${dbField} = ?`);
        
        // 特殊处理JSON字段
        if (field === 'learningPoints' && chapterData[field]) {
          params.push(JSON.stringify(chapterData[field]));
        } else {
          params.push(chapterData[field]);
        }
      }
    });
    
    if (fields.length === 0) return false;
    
    params.push(id);
    const sql = `UPDATE course_chapters SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除章节
  static async delete(id) {
    const sql = 'DELETE FROM course_chapters WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 统计课程的章节数
  static async countByCourseId(courseId) {
    const sql = `
      SELECT COUNT(*) as total 
      FROM course_chapters 
      WHERE course_id = ? AND status = 'active'
    `;
    const results = await db.query(sql, [courseId]);
    return results[0].total;
  }
}

module.exports = CourseChapter;

