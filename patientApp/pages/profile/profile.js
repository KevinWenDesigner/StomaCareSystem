// patient-app/pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: {
      name: '张患者',
      age: 65,
      gender: '女',
      careDays: 15,
      avatarUrl: '', // 新增：用户头像URL
      nickName: '' // 新增：微信昵称
    },
    editUserInfo: {
      name: '张患者',
      age: 65,
      gender: '女',
      careDays: 15,
      avatarUrl: '',
      nickName: ''
    },
    showEditModal: false,
    healthData: {
      assessments: 0,
      records: 0,
      lessons: 0,
      score: 85
    },
    hasUserInfo: false, // 新增：是否已获取用户信息
    canIUseGetUserProfile: false // 新增：是否支持getUserProfile接口
  },

  onLoad() {
    console.log('个人中心页面加载')
    
    // 检查是否支持getUserProfile接口
    const canIUseGetUserProfile = !!wx.getUserProfile
    
    this.setData({
      canIUseGetUserProfile: canIUseGetUserProfile
    })
    
    console.log('getUserProfile支持状态:', canIUseGetUserProfile)
    
    this.loadUserData()
  },

  onShow() {
    console.log('个人中心页面显示')
    this.loadUserData()
  },

  // 加载用户数据
  loadUserData() {
    try {
      // 加载用户信息
      const userInfo = wx.getStorageSync('userInfo') || this.data.userInfo
      
      // 检查是否已获取微信用户信息（只有真正获取到微信信息才算）
      const hasUserInfo = !!(userInfo.nickName && userInfo.nickName.trim() !== '' || 
                            userInfo.avatarUrl && userInfo.avatarUrl.trim() !== '')
      
      // 计算健康数据
      const assessmentHistory = wx.getStorageSync('assessmentHistory') || []
      const symptomRecords = wx.getStorageSync('symptomRecords') || []
      const learningData = wx.getStorageSync('learningData') || { courses: [] }
      
      const healthData = {
        assessments: assessmentHistory.length,
        records: symptomRecords.length,
        lessons: learningData.courses.length,
        score: this.calculateHealthScore(symptomRecords)
      }
      
      this.setData({
        userInfo,
        healthData,
        hasUserInfo
      })
    } catch (e) {
      console.error('加载用户数据失败:', e)
    }
  },

  // 获取微信用户信息
  getUserProfile() {
    console.log('获取微信用户信息')
    
    wx.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
      success: (res) => {
        console.log('获取用户信息成功:', res)
        
        const { userInfo: wxUserInfo } = res
        
        // 更新用户信息，保留原有的手动输入信息
        const updatedUserInfo = {
          ...this.data.userInfo,
          nickName: wxUserInfo.nickName,
          avatarUrl: wxUserInfo.avatarUrl
        }
        
        console.log('更新后的用户信息:', updatedUserInfo)
        
        // 立即更新页面显示
        this.setData({
          userInfo: updatedUserInfo,
          hasUserInfo: true
        })
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', updatedUserInfo)
        
        // 显示成功提示
        app.showToast('用户信息获取成功', 'success')
        
        // 延迟一下再刷新数据，确保页面完全更新
        setTimeout(() => {
          this.loadUserData()
        }, 500)
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        if (err.errMsg.includes('cancel')) {
          app.showToast('用户取消授权', 'none')
        } else {
          app.showToast('获取用户信息失败', 'error')
        }
      }
    })
  },

  // 选择头像
  chooseAvatar() {
    console.log('选择头像')
    
    wx.chooseAvatar({
      success: (res) => {
        console.log('选择头像成功:', res)
        
        const { avatarUrl } = res
        
        // 更新用户头像
        const updatedUserInfo = {
          ...this.data.userInfo,
          avatarUrl: avatarUrl
        }
        
        console.log('更新后的用户信息:', updatedUserInfo)
        
        // 立即更新页面显示
        this.setData({
          userInfo: updatedUserInfo
        })
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', updatedUserInfo)
        
        // 显示成功提示
        app.showToast('头像更新成功', 'success')
        
        // 延迟一下再刷新数据，确保页面完全更新
        setTimeout(() => {
          this.loadUserData()
        }, 500)
      },
      fail: (err) => {
        console.error('选择头像失败:', err)
        if (err.errMsg.includes('cancel')) {
          app.showToast('用户取消选择', 'none')
        } else {
          app.showToast('选择头像失败', 'error')
        }
      }
    })
  },

  // 计算健康评分
  calculateHealthScore(records) {
    if (records.length === 0) return 85
    
    const avgPain = records.reduce((sum, r) => sum + r.painLevel, 0) / records.length
    const baseScore = 100 - (avgPain - 1) * 10
    
    return Math.max(60, Math.min(100, Math.round(baseScore)))
  },

  // 显示编辑模态框
  showEditModal() {
    console.log('显示编辑模态框')
    
    // 确保编辑信息包含所有当前用户信息
    const editUserInfo = { 
      ...this.data.userInfo,
      // 如果没有微信昵称，使用手动输入的姓名作为默认值
      name: this.data.userInfo.nickName || this.data.userInfo.name
    }
    
    this.setData({
      showEditModal: true,
      editUserInfo: editUserInfo
    })
  },

  // 关闭编辑模态框
  closeEditModal() {
    console.log('关闭编辑模态框')
    this.setData({
      showEditModal: false
    })
  },

  // 输入编辑用户信息
  inputEditUser(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`editUserInfo.${field}`]: value
    })
  },

  // 选择性别
  selectGender(e) {
    const gender = e.currentTarget.dataset.gender
    
    this.setData({
      'editUserInfo.gender': gender
    })
  },

  // 保存编辑
  saveEdit() {
    const { editUserInfo } = this.data
    
    if (!editUserInfo.name || !editUserInfo.age || !editUserInfo.gender || !editUserInfo.careDays) {
      app.showToast('请填写完整信息', 'error')
      return
    }
    
    // 验证年龄
    const age = parseInt(editUserInfo.age)
    if (age < 1 || age > 120) {
      app.showToast('请输入正确的年龄', 'error')
      return
    }
    
    // 验证护理天数
    const careDays = parseInt(editUserInfo.careDays)
    if (careDays < 0 || careDays > 3650) {
      app.showToast('请输入正确的护理天数', 'error')
      return
    }
    
    // 保存用户信息，保留微信获取的昵称和头像
    const userInfo = {
      ...this.data.userInfo, // 保留微信获取的信息
      ...editUserInfo, // 更新编辑的信息
      age: age,
      careDays: careDays
    }
    
    console.log('保存编辑后的用户信息:', userInfo)
    
    this.setData({
      userInfo,
      showEditModal: false
    })
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo)
    
    app.showToast('个人信息已更新', 'success')
  },

  // 查看健康报告
  viewHealthReport() {
    console.log('查看健康报告')
    
    // 跳转到健康报告页面
    wx.navigateTo({
      url: '/pages/health-report/health-report',
      success: (res) => {
        console.log('跳转到健康报告页面成功:', res)
      },
      fail: (err) => {
        console.error('跳转到健康报告页面失败:', err)
        app.showToast('页面跳转失败', 'error')
      }
    })
  },

  // 查看护理计划
  viewCarePlan() {
    console.log('查看护理计划')
    
    // 跳转到护理计划页面
    wx.navigateTo({
      url: '/pages/care-plan/care-plan',
      success: (res) => {
        console.log('跳转到护理计划页面成功:', res)
      },
      fail: (err) => {
        console.error('跳转到护理计划页面失败:', err)
        app.showToast('页面跳转失败', 'error')
      }
    })
  },

  // 查看提醒设置
  viewReminders() {
    console.log('查看提醒设置')
    
    // 跳转到提醒设置页面
    wx.navigateTo({
      url: '/pages/reminders/reminders',
      success: (res) => {
        console.log('跳转到提醒设置页面成功:', res)
      },
      fail: (err) => {
        console.error('跳转到提醒设置页面失败:', err)
        app.showToast('页面跳转失败', 'error')
      }
    })
  },

  // 查看家属管理
  viewFamily() {
    console.log('查看家属管理')
    
    // 跳转到家属管理页面
    wx.navigateTo({
      url: '/pages/family/family',
      success: (res) => {
        console.log('跳转到家属管理页面成功:', res)
      },
      fail: (err) => {
        console.error('跳转到家属管理页面失败:', err)
        app.showToast('页面跳转失败', 'error')
      }
    })
  },

  // 查看隐私设置
  viewPrivacy() {
    console.log('查看隐私设置')
    
    // 跳转到隐私设置页面
    wx.navigateTo({
      url: '/pages/privacy/privacy',
      success: (res) => {
        console.log('跳转到隐私设置页面成功:', res)
      },
      fail: (err) => {
        console.error('跳转到隐私设置页面失败:', err)
        app.showToast('页面跳转失败', 'error')
      }
    })
  },

  // 查看帮助中心
  viewHelp() {
    console.log('查看帮助中心')
    
    // 跳转到帮助中心页面
    wx.navigateTo({
      url: '/pages/help/help',
      success: (res) => {
        console.log('跳转到帮助中心页面成功:', res)
      },
      fail: (err) => {
        console.error('跳转到帮助中心页面失败:', err)
        app.showToast('页面跳转失败', 'error')
      }
    })
  },

  // 查看关于我们
  viewAbout() {
    console.log('查看关于我们')
    wx.showModal({
      title: '关于我们',
      content: '造口护理患者端 v1.0.0\n\n专业的造口护理管理平台，为患者提供全方位的护理支持。',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 联系客服
  contactSupport() {
    console.log('联系客服')
    wx.showModal({
      title: '联系客服',
      content: '客服电话: 400-123-4567\n客服时间: 8:00-20:00',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清除登录数据
            wx.removeStorageSync('userInfo')
            wx.removeStorageSync('token')
            wx.removeStorageSync('patientInfo')
            
            // 清除全局数据
            app.globalData.userInfo = null
            app.globalData.token = null
            
            app.showToast('已退出登录', 'success')
            
            // 跳转到登录页面
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }, 1000)
          } catch (e) {
            console.error('退出登录失败:', e)
            app.showToast('退出失败，请重试', 'error')
          }
        }
      }
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '个人中心 - 造口护理患者端',
      path: '/pages/profile/profile'
    }
  },

  // 测试微信用户信息获取功能
  testWechatUserInfo() {
    console.log('测试微信用户信息获取功能')
    
    // 检查是否支持getUserProfile
    if (!wx.getUserProfile) {
      app.showToast('当前微信版本不支持获取用户信息', 'error')
      return
    }
    
    // 检查是否已经获取过用户信息
    if (this.data.hasUserInfo) {
      app.showToast('已经获取过用户信息了', 'none')
      return
    }
    
    // 调用获取用户信息
    this.getUserProfile()
  },

  // 测试用户信息显示
  testUserInfoDisplay() {
    console.log('当前用户信息:', this.data.userInfo)
    console.log('hasUserInfo状态:', this.data.hasUserInfo)
    
    // 显示当前用户信息
    wx.showModal({
      title: '当前用户信息',
      content: `昵称: ${this.data.userInfo.nickName || '未设置'}\n姓名: ${this.data.userInfo.name}\n头像: ${this.data.userInfo.avatarUrl ? '已设置' : '未设置'}\n年龄: ${this.data.userInfo.age}\n性别: ${this.data.userInfo.gender}\n护理天数: ${this.data.userInfo.careDays}`,
      showCancel: false,
      confirmText: '确定'
    })
  }
})