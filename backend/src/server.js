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

// 根路径 - 重定向到数据大屏（必须在静态文件服务之前）
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// API信息（必须在 API 路由之前）
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
      dashboard: '/api/dashboard',
      sse: '/api/sse'
    }
  });
});

// API路由（包含 SSE 路由）
app.use('/api', routes);

// 初始化 SSE 服务（Server-Sent Events 实时推送）
// 注意：SSE 路由已在 routes/index.js 中注册
console.log('✅ 使用 SSE (Server-Sent Events) 进行实时推送');
console.log('✅ SSE 端点: GET /api/sse');

// 静态文件服务（前端页面）
// 放在 API 路由之后，但要在 404 处理之前
// 注意：在生产环境中，推荐使用 Nginx 直接提供静态文件，而不是通过 Node.js
const staticPath = path.join(__dirname, '../../');
const fs = require('fs');

// 检查静态文件目录是否存在
if (fs.existsSync(staticPath)) {
  console.log(`📁 静态文件目录: ${staticPath}`);
  
  // 检查 index.html 是否存在
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`✅ 找到 index.html: ${indexPath}`);
  } else {
    console.warn(`⚠️  未找到 index.html: ${indexPath}`);
    console.warn(`   请确保 index.html 文件存在于项目根目录`);
  }
  
  app.use(express.static(staticPath, {
    // 设置 index 文件，确保可以访问 index.html
    index: 'index.html',
    // 当文件不存在时，不返回错误，继续到下一个中间件
    fallthrough: true
  }));
} else {
  console.warn(`⚠️  静态文件目录不存在: ${staticPath}`);
  console.warn(`   请检查路径是否正确，或使用 Nginx 提供静态文件`);
  console.warn(`   当前工作目录: ${process.cwd()}`);
  console.warn(`   __dirname: ${__dirname}`);
}

// 404错误处理（静态文件服务之后，处理所有未匹配的请求）
app.use((req, res, next) => {
  // 如果是 API 请求，返回 JSON 格式的 404
  if (req.path.startsWith('/api/')) {
    return notFoundHandler(req, res);
  }
  // 如果是静态文件请求，尝试返回 index.html（用于 SPA 路由）
  if (req.accepts('html')) {
    // 检查 index.html 是否存在
    const indexPath = path.join(staticPath, 'index.html');
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  // 其他情况返回 404
  notFoundHandler(req, res);
});

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
      // 注意：使用兼容旧版本 Node.js 的写法（不使用可选链操作符）
      const assessment = data.assessment || {};
      const alertData = {
        patient: data.patient || assessment.patient_name || '未知患者',
        risk_level: data.risk_level || assessment.risk_level || 'unknown',
        assessment_id: data.assessment_id || assessment.id || null,
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




