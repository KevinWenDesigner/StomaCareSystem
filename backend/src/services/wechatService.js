const axios = require('axios');
const wechatConfig = require('../config/wechat');

class WechatService {
  // 微信登录 - code换取session_key和openid
  static async code2Session(code) {
    try {
      const response = await axios.get(wechatConfig.apiUrls.code2Session, {
        params: {
          appid: wechatConfig.appId,
          secret: wechatConfig.appSecret,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });

      const data = response.data;

      if (data.errcode) {
        throw new Error(`微信登录失败: ${data.errmsg}`);
      }

      return {
        openid: data.openid,
        sessionKey: data.session_key,
        unionId: data.unionid
      };
    } catch (error) {
      console.error('微信code2Session错误:', error);
      throw new Error('微信登录服务异常');
    }
  }

  // 获取微信access_token
  static async getAccessToken() {
    try {
      const response = await axios.get(wechatConfig.apiUrls.getAccessToken, {
        params: {
          grant_type: 'client_credential',
          appid: wechatConfig.appId,
          secret: wechatConfig.appSecret
        }
      });

      const data = response.data;

      if (data.errcode) {
        throw new Error(`获取access_token失败: ${data.errmsg}`);
      }

      return data.access_token;
    } catch (error) {
      console.error('获取微信access_token错误:', error);
      throw new Error('获取微信凭证失败');
    }
  }

  // 发送订阅消息
  static async sendSubscribeMessage(openid, templateId, data, page = '') {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
        {
          touser: openid,
          template_id: templateId,
          page: page,
          data: data
        }
      );

      if (response.data.errcode !== 0) {
        throw new Error(`发送订阅消息失败: ${response.data.errmsg}`);
      }

      return true;
    } catch (error) {
      console.error('发送订阅消息错误:', error);
      return false;
    }
  }
}

module.exports = WechatService;




