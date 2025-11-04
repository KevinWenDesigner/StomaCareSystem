const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// 验证JWT token
const verifyToken = (req, res, next) => {
  try {
    // 从header中获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    // 格式: Bearer <token>
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '令牌格式错误'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // 将用户信息附加到请求对象
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '令牌验证失败'
    });
  }
};

// 验证用户类型
const checkUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未认证'
      });
    }
    
    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: '无权限访问'
      });
    }
    
    next();
  };
};

// 验证是否是患者本人或其护士
const checkPatientAccess = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.body.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: '缺少患者ID'
      });
    }
    
    // 如果是患者本人
    if (req.user.userType === 'patient' && req.user.patientId === parseInt(patientId)) {
      return next();
    }
    
    // 如果是护士，检查是否是该患者的护士
    if (req.user.userType === 'nurse') {
      const db = require('../config/database');
      const [patients] = await db.query(
        'SELECT nurse_id FROM patients WHERE id = ?',
        [patientId]
      );
      
      if (patients.length > 0 && patients[0].nurse_id === req.user.nurseId) {
        return next();
      }
    }
    
    // 管理员有全部权限
    if (req.user.userType === 'admin') {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: '无权限访问该患者信息'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '权限验证失败'
    });
  }
};

module.exports = {
  verifyToken,
  checkUserType,
  checkPatientAccess
};
