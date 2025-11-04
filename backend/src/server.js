const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// 创建Express应用
const app = express();

// 环境变量
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 中间件配置
app.use(cors()); // 启用CORS
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

// API路由
app.use('/api', routes);

// 根路径
app.get('/', (req, res) => {
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
      families: '/api/families'
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
    
    // 启动HTTP服务
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(50));
      console.log('🚀 造口护理系统后端服务已启动');
      console.log('='.repeat(50));
      console.log(`📍 服务地址: http://localhost:${PORT}`);
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




