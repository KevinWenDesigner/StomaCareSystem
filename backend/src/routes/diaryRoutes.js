const express = require('express');
const router = express.Router();
const DiaryController = require('../controllers/diaryController');
const { verifyToken } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(verifyToken);

// 创建症状日记
router.post('/', DiaryController.create);

// 获取症状日记列表
router.get('/', DiaryController.getList);

// 获取统计数据
router.get('/stats', DiaryController.getStats);

// 根据日期获取日记
router.get('/:patientId/:date', DiaryController.getByDate);

// 获取日记详情
router.get('/:id', DiaryController.getById);

// 更新症状日记
router.put('/:id', DiaryController.update);

// 删除症状日记
router.delete('/:id', DiaryController.delete);

module.exports = router;




