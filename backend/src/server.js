const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');

// 首先加载环境变量
require('dotenv').config();

// 在加载其他模块之前设置 NODE_ENV 默认值
// 这样可以确保路由文件加载时能正确判断环境
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

// 环境变量
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;

// 输出环境信息（用于调试）
console.log(`[Server] 当前环境: NODE_ENV = "${NODE_ENV}"`);

const db = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const sseService = require('./services/sseService');
const dataEmitter = require('./utils/eventEmitter');

// 创建Express应用
const app = express();

// 中间件配置
// CORS 配置 - 允许前端跨域访问
app.use(cors({
    origin: [
        'https://kevinwendesigner.github.io',  // ⚠️ GitHub Pages 部署后，替换为实际地址
		    'https://stoma.ht-healthcare.com',
        'http://localhost:3000',            // 本地开发
        'http://localhost:8080',            // 本地开发备用端口
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080'
    ],
    credentials: true,                      // 允许携带凭证(cookies/token)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 日志中间件
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 静态文件服务（前端页面）
app.use(express.static(path.join(__dirname, '../../')));

// 初始化 SSE 服务（Server-Sent Events 实时推送）
// 在路由之前注册，确保路由优先级
sseService.initialize(app);
console.log('✅ 使用 SSE (Server-Sent Events) 进行实时推送');

// API路由
app.use('/api', routes);

// 根路径 - 重定向到数据大屏
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// API信息
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '造口护理系统API服务',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      patients: '/api/patients',
      assessments: '/api/assessments',
      diaries: '/api/diaries',
      courses: '/api/courses',
      reports: '/api/reports',
      carePlans: '/api/care-plans',
      reminders: '/api/reminders',
      families: '/api/families',
      dashboard: '/api/dashboard'
    }
  });
});

// 404错误处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    console.log('🔌 正在连接数据库...');
    const connected = await db.testConnection();
    
    if (!connected) {
      console.error('❌ 数据库连接失败，请检查配置');
      process.exit(1);
    }
    
    // 创建 HTTP 服务器
    const server = http.createServer(app);
    
    // 监听数据变更事件并推送到客户端
    console.log('🔧 注册事件监听器...');
    
    dataEmitter.on(dataEmitter.EVENTS.DASHBOARD_REFRESH, (data) => {
      console.log('📊 [Server] Dashboard 数据变更，推送更新...');
      console.log('📊 [Server] 数据:', JSON.stringify(data, null, 2));
      sseService.pushDashboardUpdate(data.type || data.action || 'manual', data);
    });
    
    dataEmitter.on(dataEmitter.EVENTS.ASSESSMENT_CREATED, (assessment) => {
      console.log('📝 [Server] 新评估创建，推送通知...');
      console.log('📝 [Server] 评估数据:', JSON.stringify(assessment, null, 2));
      sseService.pushNewAssessment(assessment);
      
      // 如果是高危患者，发送警报
      if (assessment.risk_level === 'critical' || assessment.risk_level === 'poor') {
        console.log('🚨 [Server] 检测到高危患者，发送警报...');
        sseService.pushHighRiskAlert({
          patient: assessment.patient_name,
          risk_level: assessment.risk_level,
          assessment_id: assessment.id
        });
      }
    });
    
    dataEmitter.on(dataEmitter.EVENTS.ASSESSMENT_REVIEWED, (assessment) => {
      console.log('👩‍⚕️ [Server] 评估审核事件，推送通知...');
      console.log('👩‍⚕️ [Server] 审核数据:', JSON.stringify(assessment, null, 2));
      sseService.pushDashboardUpdate('assessment', { type: 'assessment', action: 'reviewed', data: assessment });
    });
    
    dataEmitter.on(dataEmitter.EVENTS.HIGH_RISK_ALERT, (data) => {
      console.log('🚨 [Server] 高危患者警报，推送通知...');
      console.log('🚨 [Server] 警报数据:', JSON.stringify(data, null, 2));
      // data 可能是 { patient, assessment } 或 { patient, risk_level, assessment_id }
      // 统一格式：确保有 patient 字段
      const alertData = {
        patient: data.patient || data.assessment?.patient_name || '未知患者',
        risk_level: data.risk_level || data.assessment?.risk_level || 'unknown',
        assessment_id: data.assessment_id || data.assessment?.id || null,
        ...data
      };
      sseService.pushHighRiskAlert(alertData);
    });
    
    console.log('✅ 事件监听器注册完成');
    console.log(`   - DASHBOARD_REFRESH: ${dataEmitter.listenerCount(dataEmitter.EVENTS.DASHBOARD_REFRESH)} 个监听器`);
    console.log(`   - ASSESSMENT_CREATED: ${dataEmitter.listenerCount(dataEmitter.EVENTS.ASSESSMENT_CREATED)} 个监听器`);
    console.log(`   - ASSESSMENT_REVIEWED: ${dataEmitter.listenerCount(dataEmitter.EVENTS.ASSESSMENT_REVIEWED)} 个监听器`);
    console.log(`   - HIGH_RISK_ALERT: ${dataEmitter.listenerCount(dataEmitter.EVENTS.HIGH_RISK_ALERT)} 个监听器`);
    
    // 启动HTTP服务
    server.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(50));
      console.log('🚀 造口护理系统后端服务已启动');
      console.log('='.repeat(50));
      console.log(`📍 HTTP 服务: http://localhost:${PORT}`);
      console.log(`📡 SSE 服务: http://localhost:${PORT}/api/sse`);
      console.log(`🌍 环境: ${NODE_ENV}`);
      console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
      console.log('='.repeat(50));
      console.log('');
      console.log('API端点:');
      console.log(`  - 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`  - 认证接口: http://localhost:${PORT}/api/auth`);
      console.log(`  - 患者管理: http://localhost:${PORT}/api/patients`);
      console.log(`  - AI评估: http://localhost:${PORT}/api/assessments`);
      console.log(`  - 症状日记: http://localhost:${PORT}/api/diaries`);
      console.log(`  - 护理教育: http://localhost:${PORT}/api/courses`);
      console.log(`  - 健康报告: http://localhost:${PORT}/api/reports`);
      console.log(`  - 护理计划: http://localhost:${PORT}/api/care-plans`);
      console.log(`  - 提醒管理: http://localhost:${PORT}/api/reminders`);
      console.log(`  - 家属管理: http://localhost:${PORT}/api/families`);
      console.log('');
      console.log('💡 提示: 按 Ctrl+C 停止服务');
      console.log('='.repeat(50));
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n⏹️  收到SIGTERM信号，正在关闭服务...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⏹️  收到SIGINT信号，正在关闭服务...');
  process.exit(0);
});

// 启动服务
startServer();

module.exports = app;




