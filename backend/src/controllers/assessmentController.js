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
      
      // 如果无法评估（can_assess: false），不写入数据库，直接返回AI分析结果
      if (aiResult.canAssess === false) {
        return response.success(res, {
          imageUrl,
          aiAnalysis: {
            canAssess: aiResult.canAssess,
            woundType: aiResult.woundType,
            notAssessableReason: aiResult.notAssessableReason,
            
            // 造口信息
            stomaColor: aiResult.stomaColor,
            stomaSize: aiResult.stomaSize,
            stomaShape: aiResult.stomaShape,
            skinCondition: aiResult.skinCondition,
            
            // DET评分
            detScore: aiResult.detScore,
            detLevel: aiResult.detLevel,
            detLevelText: aiResult.detLevelText,
            score: aiResult.score,
            
            // AI分析
            issues: aiResult.issues,
            suggestions: aiResult.suggestions,
            confidence: aiResult.confidence,
            detailedAnalysis: aiResult.detailedAnalysis,
            
            // 健康指标
            healthMetrics: aiResult.healthMetrics
          }
        }, '图片分析完成（未保存到数据库）');
      }
      
      // 可以评估（can_assess: true），保存评估记录到数据库
      const assessmentData = {
        patientId,
        imageUrl,
        aiResult: aiResult.rawData,
        
        // 造口基本信息
        stomaColor: aiResult.stomaColor,
        stomaSize: aiResult.stomaSize,
        stomaShape: aiResult.stomaShape,
        skinCondition: aiResult.skinCondition,
        
        // DET评分
        detScore: aiResult.detScore,
        detLevel: aiResult.detLevel || 'excellent',
        score: (aiResult.detScore && aiResult.detScore.total) || 0,  // score直接存储DET总分(0-15)
        
        // AI分析
        confidence: aiResult.confidence || 0.85,
        issues: aiResult.issues || [],
        detailedAnalysis: aiResult.detailedAnalysis || '',
        suggestions: Array.isArray(aiResult.suggestions) 
          ? aiResult.suggestions.join('\n') 
          : (aiResult.suggestions || ''),
        
        // 健康指标
        healthMetrics: aiResult.healthMetrics
      };
      
      const assessmentId = await Assessment.create(assessmentData);
      const assessment = await Assessment.findById(assessmentId);
      
      return response.created(res, {
        ...assessment,
        aiAnalysis: {
          canAssess: aiResult.canAssess,
          woundType: aiResult.woundType,
          notAssessableReason: aiResult.notAssessableReason,
          
          // 造口信息
          stomaColor: aiResult.stomaColor,
          stomaSize: aiResult.stomaSize,
          stomaShape: aiResult.stomaShape,
          skinCondition: aiResult.skinCondition,
          
          // DET评分
          detScore: aiResult.detScore,
          detLevel: aiResult.detLevel,
          detLevelText: aiResult.detLevelText,
          score: aiResult.score,
          
          // AI分析
          issues: aiResult.issues,
          suggestions: aiResult.suggestions,
          confidence: aiResult.confidence,
          detailedAnalysis: aiResult.detailedAnalysis,
          
          // 健康指标
          healthMetrics: aiResult.healthMetrics
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
        detLevel: riskLevel,  // 兼容旧参数名riskLevel
        nurseReview: nurseReview !== undefined ? parseInt(nurseReview) : undefined,
        startDate,
        endDate,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const assessments = await Assessment.findAll(filters);
      const total = await Assessment.count({ 
        patientId: filters.patientId, 
        detLevel: riskLevel,
        startDate: filters.startDate,
        endDate: filters.endDate
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
      const patientId = req.user.patientId;
      const userType = req.user.userType;
      
      // 查找评估记录
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return response.notFound(res, '评估记录不存在');
      }
      
      // 验证权限：患者只能删除自己的评估记录，护士和管理员可以删除任何记录
      if (userType === 'patient' && assessment.patientId !== patientId) {
        return response.forbidden(res, '无权删除此评估记录');
      }
      
      // 执行删除
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




