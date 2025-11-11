// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 记录错误
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // 默认500服务器错误
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';

  // 处理特定类型的错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权访问';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = '数据已存在';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = '文件大小超出限制';
  }

  // 返回错误响应
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? {
      details: err.message,
      stack: err.stack
    } : undefined
  });
};

// 404错误处理
const notFoundHandler = (req, res) => {
  // 记录 404 请求（用于调试）
  const isApiRequest = req.path.startsWith('/api/');
  const logLevel = isApiRequest ? '❌' : '⚠️';
  
  console.log(`${logLevel} 404 Not Found: ${req.method} ${req.path}`);
  console.log(`   原始URL: ${req.originalUrl}`);
  console.log(`   查询参数: ${JSON.stringify(req.query)}`);
  console.log(`   请求头 Accept: ${req.headers['accept'] || 'N/A'}`);
  
  // 特殊处理 SSE 路由的 404（用于诊断）
  if (req.path === '/api/sse' || req.path === '/sse') {
    console.error('🚨 [SSE 404] SSE 路由返回 404，可能的原因：');
    console.error('   1. 路由未正确注册');
    console.error('   2. 路由注册顺序错误');
    console.error('   3. Nginx 配置问题（生产环境）');
    console.error('   4. 服务器代码未更新');
    console.error('   5. 请求路径不匹配');
    console.error(`   当前路径: ${req.path}`);
    console.error(`   原始URL: ${req.originalUrl}`);
    console.error(`   基础URL: ${req.baseUrl}`);
    // 使用兼容旧版本 Node.js 的写法（不使用可选链操作符）
    const routePath = (req.route && req.route.path) ? req.route.path : 'N/A';
    console.error(`   路由路径: ${routePath}`);
  }
  
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    path: req.path,
    method: req.method,
    originalUrl: req.originalUrl,
    // 如果是 API 请求，提供更多调试信息（开发环境）
    ...(process.env.NODE_ENV === 'development' && isApiRequest ? {
      debug: {
        baseUrl: req.baseUrl,
        route: (req.route && req.route.path) ? req.route.path : null,
        registeredRoutes: [
          '/api/health',
          '/api/sse',
          '/api/auth',
          '/api/patients',
          '/api/assessments',
          '/api/diaries',
          '/api/courses',
          '/api/reports',
          '/api/care-plans',
          '/api/reminders',
          '/api/families',
          '/api/dashboard'
        ]
      }
    } : {})
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
