// 患者端配置文件
// ===========================================
// 环境配置：修改此处即可切换环境
// ===========================================
const ENV = 'development'; // 可选值: 'production' | 'development' | 'test'

// ===========================================
// 环境配置定义
// ===========================================
const environments = {
  // 生产环境
  production: {
    apiBaseUrl: 'https://stoma.ht-healthcare.com/api',
    uploadUrl: 'https://stoma.ht-healthcare.com/api/assessments/upload',
    timeout: 10000,
    enableDebug: false,
  },
  
  // 开发环境（本地调试）
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    uploadUrl: 'http://localhost:3000/api/assessments/upload',
    timeout: 30000, // 开发环境超时时间更长，方便调试
    enableDebug: true,
  },
  
  // 测试环境
  test: {
    apiBaseUrl: 'http://192.168.1.100:3000/api', // 根据实际情况修改
    uploadUrl: 'http://192.168.1.100:3000/api/assessments/upload',
    timeout: 15000,
    enableDebug: true,
  }
};

// ===========================================
// 导出配置
// ===========================================
const currentConfig = environments[ENV];

module.exports = {
  // 当前环境
  env: ENV,
  
  // API配置
  apiBaseUrl: currentConfig.apiBaseUrl,
  uploadUrl: currentConfig.uploadUrl,
  
  // 请求配置
  timeout: currentConfig.timeout,
  
  // 调试配置
  enableDebug: currentConfig.enableDebug,
  
  // 版本信息
  version: '1.0.0',
  
  // 辅助方法：判断当前环境
  isProduction: () => ENV === 'production',
  isDevelopment: () => ENV === 'development',
  isTest: () => ENV === 'test',
  
  // 辅助方法：获取完整URL
  getFullUrl: (path) => {
    // 移除开头的斜杠，避免重复
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${currentConfig.apiBaseUrl}/${cleanPath}`;
  },
  
  // 辅助方法：调试日志（仅在开发环境输出）
  log: (...args) => {
    if (currentConfig.enableDebug) {
      console.log('[Debug]', ...args);
    }
  }
};
