const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(verifyToken);

// 生成健康报告
router.get('/generate', ReportController.generateReport);

// 获取我的报告
router.get('/my-report', ReportController.getMyReport);

module.exports = router;




