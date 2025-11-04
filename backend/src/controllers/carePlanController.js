const CarePlan = require('../models/CarePlan');
const response = require('../utils/response');
const validator = require('../utils/validator');

class CarePlanController {
  // 创建护理计划
  static async create(req, res, next) {
    try {
      const planData = {
        ...req.body,
        nurseId: req.user.nurseId || req.body.nurseId
      };
      
      // 验证必填字段
      const errors = validator.validateRequired(planData, ['patientId', 'title', 'startDate']);
      if (errors) {
        return response.validationError(res, errors);
      }
      
      const planId = await CarePlan.create(planData);
      const plan = await CarePlan.findById(planId);
      
      return response.created(res, plan);
    } catch (error) {
      next(error);
    }
  }

  // 获取护理计划详情
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const plan = await CarePlan.findById(id);
      
      if (!plan) {
        return response.notFound(res, '护理计划不存在');
      }
      
      // 获取计划项目
      const items = await CarePlan.getItems(id);
      plan.items = items;
      
      return response.success(res, plan);
    } catch (error) {
      next(error);
    }
  }

  // 获取护理计划列表
  static async getList(req, res, next) {
    try {
      const { patientId, nurseId, status, page = 1, pageSize = 10 } = req.query;
      
      const filters = {
        patientId: patientId || req.user.patientId,
        nurseId,
        status,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const plans = await CarePlan.findAll(filters);
      
      // 为每个计划获取项目
      for (let plan of plans) {
        plan.items = await CarePlan.getItems(plan.id);
      }
      
      return response.success(res, plans);
    } catch (error) {
      next(error);
    }
  }

  // 更新护理计划
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const planData = req.body;
      
      const plan = await CarePlan.findById(id);
      if (!plan) {
        return response.notFound(res, '护理计划不存在');
      }
      
      const success = await CarePlan.update(id, planData);
      
      if (success) {
        const updated = await CarePlan.findById(id);
        return response.success(res, updated, '更新成功');
      } else {
        return response.error(res, '更新失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 添加计划项目
  static async addItem(req, res, next) {
    try {
      const { id } = req.params;
      const itemData = {
        planId: id,
        ...req.body
      };
      
      const plan = await CarePlan.findById(id);
      if (!plan) {
        return response.notFound(res, '护理计划不存在');
      }
      
      const itemId = await CarePlan.addItem(itemData);
      const items = await CarePlan.getItems(id);
      
      return response.created(res, items, '项目添加成功');
    } catch (error) {
      next(error);
    }
  }

  // 更新项目状态
  static async updateItemStatus(req, res, next) {
    try {
      const { id, itemId } = req.params;
      const { completed } = req.body;
      
      const success = await CarePlan.updateItemStatus(itemId, completed);
      
      if (success) {
        const items = await CarePlan.getItems(id);
        return response.success(res, items, '状态更新成功');
      } else {
        return response.error(res, '更新失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 删除护理计划
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const plan = await CarePlan.findById(id);
      if (!plan) {
        return response.notFound(res, '护理计划不存在');
      }
      
      const success = await CarePlan.delete(id);
      
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

module.exports = CarePlanController;




