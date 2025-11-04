// 患者端配置文件
module.exports = {
  // API基础地址
  apiBaseUrl: 'http://localhost:3000/api',
  
  // 生产环境API地址（部署后修改）
  // apiBaseUrl: 'https://your-domain.com/api',
  
  // 文件上传配置
  uploadUrl: 'http://localhost:3000/api/assessments/upload',
  
  // 超时时间（毫秒）
  timeout: 10000,
  
  // 版本信息
  version: '1.0.0'
}

