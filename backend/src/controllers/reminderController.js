const Reminder = require('../models/Reminder');
const response = require('../utils/response');
const validator = require('../utils/validator');

class ReminderController {
  // 创建提醒
  static async create(req, res, next) {
    try {
      const patientId = req.user.patientId || req.body.patientId;
      const reminderData = {
        patientId,
        ...req.body
      };
      
      // 验证必填字段
      const errors = validator.validateRequired(reminderData, [
        'patientId', 'title', 'reminderType', 'remindTime'
      ]);
      if (errors) {
        return response.validationError(res, errors);
      }
      
      const reminderId = await Reminder.create(reminderData);
      const reminder = await Reminder.findById(reminderId);
      
      return response.created(res, reminder);
    } catch (error) {
      next(error);
    }
  }

  // 获取提醒列表
  static async getList(req, res, next) {
    try {
      const patientId = req.user.patientId || req.query.patientId;
      const { reminderType, enabled } = req.query;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const filters = {
        reminderType,
        enabled: enabled !== undefined ? parseInt(enabled) : undefined
      };
      
      const reminders = await Reminder.findByPatientId(patientId, filters);
      
      return response.success(res, reminders);
    } catch (error) {
      next(error);
    }
  }

  // 获取今日提醒
  static async getTodayReminders(req, res, next) {
    try {
      const patientId = req.user.patientId;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const reminders = await Reminder.getTodayReminders(patientId);
      
      return response.success(res, reminders);
    } catch (error) {
      next(error);
    }
  }

  // 更新提醒
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const reminderData = req.body;
      
      const reminder = await Reminder.findById(id);
      if (!reminder) {
        return response.notFound(res, '提醒不存在');
      }
      
      const success = await Reminder.update(id, reminderData);
      
      if (success) {
        const updated = await Reminder.findById(id);
        return response.success(res, updated, '更新成功');
      } else {
        return response.error(res, '更新失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 删除提醒
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const reminder = await Reminder.findById(id);
      if (!reminder) {
        return response.notFound(res, '提醒不存在');
      }
      
      const success = await Reminder.delete(id);
      
      if (success) {
        return response.success(res, null, '删除成功');
      } else {
        return response.error(res, '删除失败');
      }
    } catch (error) {
      next(error);
    }
  }

  // 完成提醒
  static async complete(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      const reminder = await Reminder.findById(id);
      if (!reminder) {
        return response.notFound(res, '提醒不存在');
      }
      
      // 添加完成记录
      const logData = {
        reminderId: id,
        remindDate: new Date().toISOString().split('T')[0],
        remindTime: reminder.remind_time,
        completed: 1,
        completedAt: new Date(),
        notes
      };
      
      await Reminder.addLog(logData);
      
      return response.success(res, null, '提醒已完成');
    } catch (error) {
      next(error);
    }
  }

  // 获取提醒记录
  static async getLogs(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate, page = 1, pageSize = 10 } = req.query;
      
      const filters = {
        startDate,
        endDate,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      };
      
      const logs = await Reminder.getLogs(id, filters);
      
      return response.success(res, logs);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReminderController;




