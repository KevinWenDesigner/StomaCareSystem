const Patient = require('../models/Patient');
const response = require('../utils/response');
const validator = require('../utils/validator');

class PatientController {
  // 创建患者信息
  static async create(req, res, next) {
    try {
      const userId = req.user.userId;
      const patientData = {
        userId,
        ...req.body
      };
      
      // 验证必填字段
      const errors = validator.validateRequired(patientData, ['name', 'gender']);
      if (errors) {
        return response.validationError(res, errors);
      }
      
      // 检查是否已存在
      const existing = await Patient.findByUserId(userId);
      if (existing) {
        return response.error(res, '患者信息已存在', 409);
      }
      
      const patientId = await Patient.create(patientData);
      const patient = await Patient.findById(patientId);
      
      return response.created(res, patient);
    } catch (error) {
      next(error);
    }
  }

  // 获取患者信息
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);
      
      if (!patient) {
        return response.notFound(res, '患者不存在');
      }
      
      return response.success(res, patient);
    } catch (error) {
      next(error);
    }
  }

  // 获取当前用户的患者信息
  static async getMyInfo(req, res, next) {
    try {
      const userId = req.user.userId;
      const patient = await Patient.findByUserId(userId);
      
      if (!patient) {
        return response.notFound(res, '患者信息不存在');
      }
      
      return response.success(res, patient);
    } catch (error) {
      next(error);
    }
  }

  // 获取患者列表
  static async getList(req, res, next) {
    try {
      const { nurseId, status, keyword, page = 1, pageSize = 10 } = req.query;
      
      const filters = {
        nurseId,
        status,
        keyword,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const patients = await Patient.findAll(filters);
      const total = await Patient.count({ nurseId, status });
      
      return response.paginated(res, patients, {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新患者信息
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const patientData = req.body;
      
      const patient = await Patient.findById(id);
      if (!patient) {
        return response.notFound(res, '患者不存在');
      }
      
      const success = await Patient.update(id, patientData);
      
      if (success) {
        const updated = await Patient.findById(id);
        return response.success(res, updated, '更新成功');
      } else {
        return response.error(res, '更新失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 删除患者
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const patient = await Patient.findById(id);
      if (!patient) {
        return response.notFound(res, '患者不存在');
      }
      
      const success = await Patient.delete(id);
      
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

module.exports = PatientController;




