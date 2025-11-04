// 统一响应格式工具

// 成功响应
const success = (res, data = null, message = '操作成功', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// 失败响应
const error = (res, message = '操作失败', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

// 分页响应
const paginated = (res, data, pagination, message = '获取成功') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
      totalPages: Math.ceil(pagination.total / (pagination.pageSize || 10))
    }
  });
};

// 创建成功响应
const created = (res, data = null, message = '创建成功') => {
  return success(res, data, message, 201);
};

// 未授权响应
const unauthorized = (res, message = '未授权访问') => {
  return error(res, message, 401);
};

// 禁止访问响应
const forbidden = (res, message = '禁止访问') => {
  return error(res, message, 403);
};

// 未找到响应
const notFound = (res, message = '资源不存在') => {
  return error(res, message, 404);
};

// 验证错误响应
const validationError = (res, errors, message = '数据验证失败') => {
  return error(res, message, 422, errors);
};

module.exports = {
  success,
  error,
  paginated,
  created,
  unauthorized,
  forbidden,
  notFound,
  validationError
};




