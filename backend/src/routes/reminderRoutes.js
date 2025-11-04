const express = require('express');
const router = express.Router();
const ReminderController = require('../controllers/reminderController');
const { verifyToken } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(verifyToken);

// 创建提醒
router.post('/', ReminderController.create);

// 获取提醒列表
router.get('/', ReminderController.getList);

// 获取今日提醒
router.get('/today', ReminderController.getTodayReminders);

// 获取提醒记录
router.get('/:id/logs', ReminderController.getLogs);

// 更新提醒
router.put('/:id', ReminderController.update);

// 完成提醒
router.post('/:id/complete', ReminderController.complete);

// 删除提醒
router.delete('/:id', ReminderController.delete);

module.exports = router;




