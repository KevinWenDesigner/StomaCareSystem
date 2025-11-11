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
const testRoutes = require('./testRoutes');

// 导入 SSE 服务（提前导入，确保可用）
const sseService = require('../services/sseService');

// API健康检查（最优先，用于监控）
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ⚠️ SSE 路由必须在其他路由之前注册，确保优先匹配
// 注意：这里注册 /sse，完整路径是 /api/sse
router.get('/sse', (req, res) => {
    console.log(`📡 [SSE Route] 收到 SSE 连接请求: ${req.method} ${req.path}`);
    console.log(`📡 [SSE Route] 请求头:`, {
        'user-agent': req.headers['user-agent'],
        'accept': req.headers['accept'],
        'origin': req.headers['origin']
    });
    sseService.handleConnection(req, res);
});

// 注册其他路由（在这些路由之后注册，避免冲突）
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

// 测试路由（路由内部会检查生产环境）
router.use('/test', testRoutes);

// 路由注册完成日志
console.log('✅ [Routes] 路由注册完成');
console.log('   - 健康检查: GET /api/health');
console.log('   - SSE 推送: GET /api/sse');
console.log('   - 其他路由: /auth, /patients, /assessments, /diaries, /courses, /reports, /care-plans, /reminders, /families, /dashboard, /test');

module.exports = router;




