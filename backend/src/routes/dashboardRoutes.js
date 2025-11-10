const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

// 获取整体统计数据
router.get('/stats', auth.verifyToken, DashboardController.getOverallStats);

// 获取实时数据
router.get('/realtime', auth.verifyToken, DashboardController.getRealTimeData);

// 获取健康趋势数据
router.get('/trends', auth.verifyToken, DashboardController.getHealthTrends);

// 获取DET维度丰富统计
router.get('/stage-stats', auth.verifyToken, DashboardController.getDETStageStats);

module.exports = router;

