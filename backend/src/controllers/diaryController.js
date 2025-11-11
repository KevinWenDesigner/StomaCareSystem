const SymptomDiary = require('../models/SymptomDiary');
const response = require('../utils/response');
const validator = require('../utils/validator');
const dataEmitter = require('../utils/eventEmitter');

class DiaryController {
  // 创建症状日记
  static async create(req, res, next) {
    try {
      const patientId = req.user.patientId || req.body.patientId;
      const diaryData = {
        patientId,
        ...req.body
      };
      
      // 验证必填字段
      const errors = validator.validateRequired(diaryData, ['patientId', 'diaryDate']);
      if (errors) {
        return response.validationError(res, errors);
      }
      
      // 检查该日期是否已有记录
      const existing = await SymptomDiary.findByPatientAndDate(patientId, diaryData.diaryDate);
      if (existing) {
        return response.error(res, '该日期已有记录，请使用更新功能', 409);
      }
      
      const diaryId = await SymptomDiary.create(diaryData);
      const diary = await SymptomDiary.findById(diaryId);
      
      // 🔔 触发 WebSocket 事件推送
      console.log('📔 症状日记创建成功，触发 WebSocket 推送...');
      dataEmitter.emitDiaryCreated({
        id: diary.id,
        patient_id: diary.patient_id,
        diary_date: diary.diary_date
      });
      
      return response.created(res, diary);
    } catch (error) {
      next(error);
    }
  }

  // 获取日记详情
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const diary = await SymptomDiary.findById(id);
      
      if (!diary) {
        return response.notFound(res, '日记不存在');
      }
      
      return response.success(res, diary);
    } catch (error) {
      next(error);
    }
  }

  // 获取日记列表
  static async getList(req, res, next) {
    try {
      const patientId = req.user.patientId || req.query.patientId;
      const { startDate, endDate, page = 1, pageSize = 10 } = req.query;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const options = {
        startDate,
        endDate,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const diaries = await SymptomDiary.findByPatientId(patientId, options);
      const total = await SymptomDiary.count(patientId, { startDate, endDate });
      
      return response.paginated(res, diaries, {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      next(error);
    }
  }

  // 根据日期获取日记
  static async getByDate(req, res, next) {
    try {
      const { patientId, date } = req.params;
      const diary = await SymptomDiary.findByPatientAndDate(patientId, date);
      
      if (!diary) {
        return response.notFound(res, '该日期无记录');
      }
      
      return response.success(res, diary);
    } catch (error) {
      next(error);
    }
  }

  // 更新日记
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const diaryData = req.body;
      
      const diary = await SymptomDiary.findById(id);
      if (!diary) {
        return response.notFound(res, '日记不存在');
      }
      
      const success = await SymptomDiary.update(id, diaryData);
      
      if (success) {
        const updated = await SymptomDiary.findById(id);
        return response.success(res, updated, '更新成功');
      } else {
        return response.error(res, '更新失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 删除日记
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const diary = await SymptomDiary.findById(id);
      if (!diary) {
        return response.notFound(res, '日记不存在');
      }
      
      const success = await SymptomDiary.delete(id);
      
      if (success) {
        return response.success(res, null, '删除成功');
      } else {
        return response.error(res, '删除失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 获取统计数据
  static async getStats(req, res, next) {
    try {
      const patientId = req.user.patientId || req.query.patientId;
      const { startDate, endDate } = req.query;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const stats = await SymptomDiary.getStats(patientId, startDate, endDate);
      
      return response.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DiaryController;




