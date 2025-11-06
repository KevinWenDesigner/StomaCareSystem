const User = require('../models/User');
const Patient = require('../models/Patient');
const WechatService = require('./wechatService');
const { generateToken } = require('../utils/jwt');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class AuthService {
  // 通用登录（用户名密码登录，用于测试和Web端）
  static async login(username, password, userType = 'nurse') {
    try {
      // 根据用户类型查询不同的表
      let query, params;
      
      if (userType === 'nurse' || !userType) {
        // 护士登录 - 使用phone或employee_id
        query = `
          SELECT id, user_id, name, phone, employee_id, department, title, hospital, status
          FROM nurses 
          WHERE (phone = ? OR employee_id = ?) AND status = 'active'
        `;
        params = [username, username];
      } else if (userType === 'patient') {
        // 患者登录 - 使用phone或id_card
        query = `
          SELECT id, user_id, name, phone, id_card, status
          FROM patients 
          WHERE (phone = ? OR id_card = ?) AND status = 'active'
        `;
        params = [username, username];
      } else {
        throw new Error('不支持的用户类型');
      }
      
      const results = await db.query(query, params);
      
      if (!results || results.length === 0) {
        throw new Error('用户名或密码错误');
      }
      
      const userData = results[0];
      
      // 对于测试环境，可以跳过密码验证或使用简单验证
      // 在生产环境中应该验证实际的密码
      // 这里暂时允许任何密码用于测试
      
      // 生成JWT token
      const tokenPayload = {
        userId: userData.id,
        userType: userType,
        name: userData.name
      };
      
      if (userType === 'patient') {
        tokenPayload.patientId = userData.id;
      } else if (userType === 'nurse') {
        tokenPayload.nurseId = userData.id;
      }
      
      const token = generateToken(tokenPayload);
      
      return {
        token,
        user: {
          id: userData.id,
          name: userData.name,
          userType: userType,
          phone: userData.phone,
          department: userData.department || null,
          employeeId: userData.employee_id || null
        }
      };
    } catch (error) {
      console.error('登录错误:', error);
      throw error;
    }
  }

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
      
      // 3. 查找或创建患者信息
      let patient = await Patient.findByUserId(user.id);
      
      // 如果是新用户且没有患者信息，自动创建默认患者记录
      if (!patient && user.user_type === 'patient') {
        console.log('创建默认患者信息，用户ID:', user.id);
        // gender: 1=男性, 2=女性, 0=未知，默认为男性
        const gender = userInfo.gender === 2 ? 'female' : 'male';
        
        const patientId = await Patient.create({
          userId: user.id,
          name: userInfo.nickname || '患者',
          gender: gender,
          birthDate: new Date(1980, 0, 1), // 默认出生日期
          phone: '',
          address: ''
        });
        
        patient = await Patient.findById(patientId);
      }
      
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
        
        // 如果患者没有记录，创建默认记录
        if (!patient) {
          console.log('刷新token时创建默认患者信息，用户ID:', user.id);
          // 默认性别为男性
          const patientId = await Patient.create({
            userId: user.id,
            name: user.nickname || '患者',
            gender: 'male',
            birthDate: new Date(1980, 0, 1),
            phone: '',
            address: ''
          });
          
          patient = await Patient.findById(patientId);
        }
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




