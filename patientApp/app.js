// patient-app/app.js
const config = require('./config.js')

App({
  globalData: {
    userInfo: null,
    userType: 'patient',
    token: null,
    apiBaseUrl: config.apiBaseUrl,
    needRefreshIndex: false // 标记是否需要刷新首页
  },

  onLaunch() {
    console.log('患者端小程序启动')
    this.checkLoginStatus()
  },

  onShow() {
    console.log('患者端小程序显示')
  },

  onHide() {
    console.log('患者端小程序隐藏')
  },

  // 检查登录状态
  checkLoginStatus() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const token = wx.getStorageSync('token')
      
      if (userInfo && token) {
        this.globalData.userInfo = userInfo
        this.globalData.token = token
        console.log('患者已登录:', userInfo.name)
      } else {
        console.log('患者未登录')
        // 清除可能存在的无效数据
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('token')
      }
    } catch (e) {
      console.error('检查登录状态失败:', e)
    }
  },

  // 显示提示
  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title,
      icon,
      duration
    })
  },

  // 显示加载
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    })
  },

  // 隐藏加载
  hideLoading() {
    wx.hideLoading()
  },

  // 网络请求封装
  request(options) {
    return new Promise((resolve, reject) => {
      // 自动拼接API基础地址
      const url = options.url.startsWith('http') 
        ? options.url 
        : `${this.globalData.apiBaseUrl}${options.url}`
      
      wx.request({
        url: url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : ''
        },
        timeout: config.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // token过期，跳转到登录页
            this.showToast('登录已过期，请重新登录')
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            this.globalData.token = null
            this.globalData.userInfo = null
            wx.reLaunch({
              url: '/pages/index/index'
            })
          } else {
            reject(res)
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err)
          this.showToast('网络请求失败，请检查网络连接')
          reject(err)
        }
      })
    })
  }
}) 