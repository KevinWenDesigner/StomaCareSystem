const FamilyMember = require('../models/FamilyMember');
const response = require('../utils/response');
const validator = require('../utils/validator');

class FamilyController {
  // 创建家属
  static async create(req, res, next) {
    try {
      const patientId = req.user.patientId || req.body.patientId;
      const familyData = {
        patientId,
        ...req.body
      };
      
      // 验证必填字段
      const errors = validator.validateRequired(familyData, ['patientId', 'name', 'relationship']);
      if (errors) {
        return response.validationError(res, errors);
      }
      
      const familyId = await FamilyMember.create(familyData);
      const family = await FamilyMember.findById(familyId);
      
      return response.created(res, family);
    } catch (error) {
      next(error);
    }
  }

  // 获取家属列表
  static async getList(req, res, next) {
    try {
      const patientId = req.user.patientId || req.query.patientId;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const families = await FamilyMember.findByPatientId(patientId);
      
      return response.success(res, families);
    } catch (error) {
      next(error);
    }
  }

  // 更新家属信息
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const familyData = req.body;
      
      const family = await FamilyMember.findById(id);
      if (!family) {
        return response.notFound(res, '家属信息不存在');
      }
      
      const success = await FamilyMember.update(id, familyData);
      
      if (success) {
        const updated = await FamilyMember.findById(id);
        return response.success(res, updated, '更新成功');
      } else {
        return response.error(res, '更新失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 设置主要联系人
  static async setPrimary(req, res, next) {
    try {
      const { id } = req.params;
      const patientId = req.user.patientId || req.body.patientId;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const family = await FamilyMember.findById(id);
      if (!family) {
        return response.notFound(res, '家属信息不存在');
      }
      
      await FamilyMember.setPrimary(id, patientId);
      const families = await FamilyMember.findByPatientId(patientId);
      
      return response.success(res, families, '设置成功');
    } catch (error) {
      next(error);
    }
  }

  // 删除家属
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const family = await FamilyMember.findById(id);
      if (!family) {
        return response.notFound(res, '家属信息不存在');
      }
      
      const success = await FamilyMember.delete(id);
      
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

module.exports = FamilyController;




