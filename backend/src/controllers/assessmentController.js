const Assessment = require('../models/Assessment');
const AIService = require('../services/aiService');
const response = require('../utils/response');
const path = require('path');

class AssessmentController {
  // 创建评估（上传图片并分析）
  static async create(req, res, next) {
    try {
      const patientId = req.user.patientId || req.body.patientId;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      if (!req.file) {
        return response.error(res, '请上传图片');
      }
      
      // 图片URL（相对路径）
      const imageUrl = `/uploads/assessments/${req.file.filename}`;
      const imagePath = req.file.path;
      
      // 调用AI分析
      const aiResult = await AIService.analyzeImage(imagePath);
      
      // 保存评估记录
      const assessmentData = {
        patientId,
        imageUrl,
        aiResult: aiResult.rawData,
        stomaColor: aiResult.stomaColor,
        stomaSize: aiResult.stomaSize,
        skinCondition: aiResult.skinCondition,
        riskLevel: aiResult.riskLevel,
        suggestions: aiResult.suggestions.join('\n')
      };
      
      const assessmentId = await Assessment.create(assessmentData);
      const assessment = await Assessment.findById(assessmentId);
      
      return response.created(res, {
        ...assessment,
        aiAnalysis: {
          stomaColor: aiResult.stomaColor,
          stomaSize: aiResult.stomaSize,
          skinCondition: aiResult.skinCondition,
          riskLevel: aiResult.riskLevel,
          suggestions: aiResult.suggestions,
          confidence: aiResult.confidence
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取评估详情
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const assessment = await Assessment.findById(id);
      
      if (!assessment) {
        return response.notFound(res, '评估记录不存在');
      }
      
      return response.success(res, assessment);
    } catch (error) {
      next(error);
    }
  }

  // 获取评估列表
  static async getList(req, res, next) {
    try {
      const { 
        patientId, 
        riskLevel, 
        nurseReview,
        startDate,
        endDate,
        page = 1, 
        pageSize = 10 
      } = req.query;
      
      const filters = {
        patientId: patientId || req.user.patientId,
        riskLevel,
        nurseReview: nurseReview !== undefined ? parseInt(nurseReview) : undefined,
        startDate,
        endDate,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const assessments = await Assessment.findAll(filters);
      const total = await Assessment.count({ 
        patientId: filters.patientId, 
        riskLevel 
      });
      
      return response.paginated(res, assessments, {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取患者的评估历史
  static async getHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const { page = 1, pageSize = 10 } = req.query;
      
      const options = {
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const assessments = await Assessment.findByPatientId(patientId, options);
      const total = await Assessment.count({ patientId });
      
      // 分析趋势
      let trend = null;
      if (assessments.length >= 2) {
        trend = AIService.analyzeTrend(assessments);
      }
      
      return response.success(res, {
        assessments,
        trend,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 护士审阅评估
  static async nurseReview(req, res, next) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return response.notFound(res, '评估记录不存在');
      }
      
      const success = await Assessment.nurseReview(id, { comment });
      
      if (success) {
        const updated = await Assessment.findById(id);
        return response.success(res, updated, '审阅成功');
      } else {
        return response.error(res, '审阅失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 获取最新评估
  static async getLatest(req, res, next) {
    try {
      const patientId = req.user.patientId || req.query.patientId;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const assessment = await Assessment.getLatest(patientId);
      
      if (!assessment) {
        return response.notFound(res, '暂无评估记录');
      }
      
      return response.success(res, assessment);
    } catch (error) {
      next(error);
    }
  }

  // 删除评估
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return response.notFound(res, '评估记录不存在');
      }
      
      const success = await Assessment.delete(id);
      
      if (success) {
        return response.success(res, null, '删除成功');
      } else {
        return response.error(res, '删除失败');
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AssessmentController;




