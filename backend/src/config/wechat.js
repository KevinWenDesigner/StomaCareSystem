require('dotenv').config();

module.exports = {
  appId: process.env.WECHAT_APPID || '',
  appSecret: process.env.WECHAT_SECRET || '',
  // 微信API地址
  apiUrls: {
    code2Session: 'https://api.weixin.qq.com/sns/jscode2session',
    getAccessToken: 'https://api.weixin.qq.com/cgi-bin/token'
  }
};



