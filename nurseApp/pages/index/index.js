// nurse-app/pages/index/index.js
const app = getApp()

Page({
  data: {
    showWelcome: true
  },

  onLoad() {
    console.log('护士端首页加载')
    this.checkLoginStatus()
  },

  onShow() {
    console.log('护士端首页显示')
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    console.log('检查护士登录状态:', app.globalData)
    
    // 检查登录状态
    if (app.globalData.userInfo && app.globalData.token) {
      console.log('护士已登录，跳转到工作台')
      // 已登录，直接跳转到工作台
      wx.switchTab({
        url: '/pages/dashboard/dashboard'
      })
    } else {
      console.log('护士未登录，显示欢迎页面')
      this.setData({
        showWelcome: true
      })
    }
  },

  // 登录
  login() {
    console.log('护士登录')
    
    // 模拟护士登录
    const mockNurseInfo = {
      id: 'nurse_001',
      name: '李护士',
      department: '造口护理科',
      phone: '13900139000',
      title: '主管护师'
    }
    
    // 保存用户信息
    wx.setStorageSync('userInfo', mockNurseInfo)
    wx.setStorageSync('token', 'mock_nurse_token_456')
    
    // 更新全局数据
    app.globalData.userInfo = mockNurseInfo
    app.globalData.token = 'mock_nurse_token_456'
    
    // 显示登录成功提示
    app.showToast('登录成功', 'success')
    
    // 跳转到工作台
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/dashboard/dashboard',
        success: () => {
          console.log('成功跳转到护士工作台')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          app.showToast('跳转失败，请重试', 'error')
        }
      })
    }, 1000)
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '造口护理护士端',
      path: '/pages/index/index'
    }
  }
}) 