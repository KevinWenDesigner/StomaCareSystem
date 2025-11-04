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
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
