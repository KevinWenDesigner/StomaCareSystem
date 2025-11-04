const User = require('../models/User');
const Patient = require('../models/Patient');
const WechatService = require('./wechatService');
const { generateToken } = require('../utils/jwt');

class AuthService {
  // 患者微信登录
  static async patientLogin(code, userInfo = {}) {
    try {
      // 1. 通过code获取openid和session_key
      const wechatData = await WechatService.code2Session(code);
      
      // 2. 查找或创建用户
      let user = await User.findByOpenid(wechatData.openid);
      
      if (!user) {
        // 创建新用户
        const userId = await User.create({
          openid: wechatData.openid,
          unionId: wechatData.unionId,
          sessionKey: wechatData.sessionKey,
          nickname: userInfo.nickname,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          userType: 'patient'
        });
        
        user = await User.findById(userId);
      } else {
        // 更新session_key和用户信息
        await User.update(user.id, {
          sessionKey: wechatData.sessionKey,
          nickname: userInfo.nickname || user.nickname,
          avatarUrl: userInfo.avatarUrl || user.avatar_url,
          gender: userInfo.gender !== undefined ? userInfo.gender : user.gender
        });
        
        user = await User.findById(user.id);
      }
      
      // 3. 查找患者信息
      let patient = await Patient.findByUserId(user.id);
      
      // 4. 生成JWT token
      const token = generateToken({
        userId: user.id,
        openid: user.openid,
        userType: user.user_type,
        patientId: patient ? patient.id : null
      });
      
      return {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          userType: user.user_type
        },
        patient: patient ? {
          id: patient.id,
          name: patient.name,
          gender: patient.gender,
          stomaType: patient.stoma_type,
          surgeryDate: patient.surgery_date
        } : null
      };
    } catch (error) {
      console.error('患者登录错误:', error);
      throw error;
    }
  }

  // 护士微信登录（需要额外验证）
  static async nurseLogin(code, credentials) {
    try {
      // 1. 通过code获取openid
      const wechatData = await WechatService.code2Session(code);
      
      // 2. 验证工号等凭证
      // TODO: 实现护士凭证验证逻辑
      
      // 3. 查找或创建用户
      let user = await User.findByOpenid(wechatData.openid);
      
      if (!user) {
        throw new Error('护士账号不存在，请联系管理员');
      }
      
      if (user.user_type !== 'nurse') {
        throw new Error('该账号不是护士账号');
      }
      
      // 4. 生成JWT token
      const token = generateToken({
        userId: user.id,
        openid: user.openid,
        userType: user.user_type
      });
      
      return {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          userType: user.user_type
        }
      };
    } catch (error) {
      console.error('护士登录错误:', error);
      throw error;
    }
  }

  // 刷新token
  static async refreshToken(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('用户不存在');
      }
      
      let patient = null;
      if (user.user_type === 'patient') {
        patient = await Patient.findByUserId(user.id);
      }
      
      const token = generateToken({
        userId: user.id,
        openid: user.openid,
        userType: user.user_type,
        patientId: patient ? patient.id : null
      });
      
      return { token };
    } catch (error) {
      console.error('刷新token错误:', error);
      throw error;
    }
  }
}

module.exports = AuthService;




