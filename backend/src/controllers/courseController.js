const Course = require('../models/Course');
const LearningRecord = require('../models/LearningRecord');
const response = require('../utils/response');

class CourseController {
  // 获取课程分类
  static async getCategories(req, res, next) {
    try {
      const categories = await Course.getCategories();
      return response.success(res, categories);
    } catch (error) {
      next(error);
    }
  }

  // 获取课程列表
  static async getList(req, res, next) {
    try {
      const { categoryId, difficulty, keyword, page = 1, pageSize = 10 } = req.query;
      
      const filters = {
        categoryId,
        difficulty,
        keyword,
        status: 'active',
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const courses = await Course.findAll(filters);
      const total = await Course.count({ categoryId, status: 'active' });
      
      return response.paginated(res, courses, {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取课程详情
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await Course.findById(id);
      
      if (!course) {
        return response.notFound(res, '课程不存在');
      }
      
      // 增加浏览次数
      await Course.incrementViewCount(id);
      
      // 如果是患者，获取学习记录
      if (req.user && req.user.patientId) {
        const record = await LearningRecord.findByPatientAndCourse(
          req.user.patientId,
          id
        );
        course.learningRecord = record;
      }
      
      return response.success(res, course);
    } catch (error) {
      next(error);
    }
  }

  // 记录学习进度
  static async recordProgress(req, res, next) {
    try {
      const { id } = req.params;
      const patientId = req.user.patientId;
      const { progress, lastPosition, studyDuration, completed } = req.body;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const course = await Course.findById(id);
      if (!course) {
        return response.notFound(res, '课程不存在');
      }
      
      const recordData = {
        patientId,
        courseId: id,
        progress: progress || 0,
        lastPosition: lastPosition || 0,
        studyDuration: studyDuration || 0,
        completed: completed || 0
      };
      
      await LearningRecord.createOrUpdate(recordData);
      const record = await LearningRecord.findByPatientAndCourse(patientId, id);
      
      return response.success(res, record, '学习记录已更新');
    } catch (error) {
      next(error);
    }
  }

  // 获取学习记录
  static async getMyLearning(req, res, next) {
    try {
      const patientId = req.user.patientId;
      const { completed, page = 1, pageSize = 10 } = req.query;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const filters = {
        completed: completed !== undefined ? parseInt(completed) : undefined,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const records = await LearningRecord.findByPatientId(patientId, filters);
      const stats = await LearningRecord.getStats(patientId);
      
      return response.success(res, {
        records,
        stats,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 点赞课程
  static async likeCourse(req, res, next) {
    try {
      const { id } = req.params;
      
      const course = await Course.findById(id);
      if (!course) {
        return response.notFound(res, '课程不存在');
      }
      
      await Course.incrementLikeCount(id);
      
      return response.success(res, null, '点赞成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseController;




