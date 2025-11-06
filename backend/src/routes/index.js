const express = require('express');
const router = express.Router();

// 导入所有路由模块
const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const diaryRoutes = require('./diaryRoutes');
const courseRoutes = require('./courseRoutes');
const reportRoutes = require('./reportRoutes');
const carePlanRoutes = require('./carePlanRoutes');
const reminderRoutes = require('./reminderRoutes');
const familyRoutes = require('./familyRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// API健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 注册路由
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/diaries', diaryRoutes);
router.use('/courses', courseRoutes);
router.use('/reports', reportRoutes);
router.use('/care-plans', carePlanRoutes);
router.use('/reminders', reminderRoutes);
router.use('/families', familyRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;




