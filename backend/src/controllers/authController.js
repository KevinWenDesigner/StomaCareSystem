const AuthService = require('../services/authService');
const response = require('../utils/response');

class AuthController {
  // 通用登录接口（用于测试和Web端）
  static async login(req, res, next) {
    try {
      const { username, password, userType } = req.body;
      
      if (!username || !password) {
        return response.error(res, '用户名和密码不能为空', 400);
      }
      
      const result = await AuthService.login(username, password, userType);
      return response.success(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  // 患者微信登录
  static async patientLogin(req, res, next) {
    try {
      const { code, userInfo } = req.body;
      
      if (!code) {
        return response.error(res, '缺少登录凭证');
      }
      
      const result = await AuthService.patientLogin(code, userInfo);
      return response.success(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  // 护士微信登录
  static async nurseLogin(req, res, next) {
    try {
      const { code, credentials } = req.body;
      
      if (!code) {
        return response.error(res, '缺少登录凭证');
      }
      
      const result = await AuthService.nurseLogin(code, credentials);
      return response.success(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req, res, next) {
    try {
      const user = req.user;
      return response.success(res, user, '获取用户信息成功');
    } catch (error) {
      next(error);
    }
  }

  // 刷新token
  static async refreshToken(req, res, next) {
    try {
      const userId = req.user.userId;
      const result = await AuthService.refreshToken(userId);
      return response.success(res, result, 'Token刷新成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;




