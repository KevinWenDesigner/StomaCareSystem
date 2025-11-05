// patient-app/pages/profile/profile.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    userInfo: null,
    patientInfo: null,
    editUserInfo: {},
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
  async loadUserData() {
    try {
      // 1. 从本地加载基础信息
      let userInfo = wx.getStorageSync('userInfo') || {}
      let patientInfo = wx.getStorageSync('patientInfo') || {}
      
      console.log('本地userInfo:', userInfo)
      console.log('本地patientInfo:', patientInfo)
      
      const hasUserInfo = !!(userInfo && (userInfo.nickName || userInfo.nickname))
      
      // 2. 从后端获取最新患者信息
      try {
        const res = await api.getMyPatient()
        if (res.success && res.data) {
          patientInfo = res.data
          
          // 计算年龄
          if (patientInfo.birth_date || patientInfo.birthDate) {
            const birthDate = new Date(patientInfo.birth_date || patientInfo.birthDate)
            const now = new Date()
            patientInfo.age = now.getFullYear() - birthDate.getFullYear()
          }
          
          // 计算护理天数
          if (patientInfo.surgery_date || patientInfo.surgeryDate) {
            const surgeryDate = new Date(patientInfo.surgery_date || patientInfo.surgeryDate)
            const now = new Date()
            const diffTime = Math.abs(now - surgeryDate)
            patientInfo.careDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          }
          
          wx.setStorageSync('patientInfo', patientInfo)
          console.log('从后端获取患者信息成功:', patientInfo)
        }
      } catch (error) {
        console.log('获取患者信息失败，使用本地缓存:', error)
      }
      
      // 3. 从后端获取健康数据统计
      let healthData = {
        assessments: 0,
        records: 0,
        lessons: 0,
        score: 85
      }
      
      try {
        // 获取评估数量
        const assessRes = await api.getAssessments({ page: 1, pageSize: 1 })
        if (assessRes.success && assessRes.pagination) {
          healthData.assessments = assessRes.pagination.total
        }
        
        // 获取日记数量
        const diaryRes = await api.getDiaries({ page: 1, pageSize: 1 })
        if (diaryRes.success && diaryRes.pagination) {
          healthData.records = diaryRes.pagination.total
        }
        
        // 获取学习记录
        const learningRes = await api.getMyLearning()
        if (learningRes.success && learningRes.data) {
          healthData.lessons = Array.isArray(learningRes.data) ? learningRes.data.length : 0
        }
        
        // 获取健康评分
        const reportRes = await api.getMyReport({ days: 30 })
        if (reportRes.success && reportRes.data) {
          healthData.score = reportRes.data.healthScore || 85
        }
      } catch (error) {
        console.log('获取健康数据失败，使用本地计算:', error)
        // 如果后端失败，使用本地数据计算
        const assessmentHistory = wx.getStorageSync('assessmentHistory') || []
        const symptomRecords = wx.getStorageSync('symptomRecords') || []
        const learningData = wx.getStorageSync('learningData') || { courses: [] }
        
        healthData = {
          assessments: assessmentHistory.length,
          records: symptomRecords.length,
          lessons: learningData.courses.length,
          score: this.calculateHealthScore(symptomRecords)
        }
      }
      
      // 确保至少有基本的默认值
      if (!patientInfo || Object.keys(patientInfo).length === 0) {
        patientInfo = {
          name: userInfo.nickName || userInfo.nickname || '患者',
          age: 0,
          gender: '-',
          careDays: 0
        }
      }
      
      console.log('最终patientInfo:', patientInfo)
      console.log('最终userInfo:', userInfo)
      console.log('最终healthData:', healthData)
      
      this.setData({
        userInfo,
        patientInfo,
        healthData,
        hasUserInfo
      })
    } catch (e) {
      console.error('加载用户数据失败:', e)
      
      // 即使失败也设置默认值
      this.setData({
        userInfo: {},
        patientInfo: {
          name: '患者',
          age: 0,
          gender: '-',
          careDays: 0
        },
        healthData: {
          assessments: 0,
          records: 0,
          lessons: 0,
          score: 85
        },
        hasUserInfo: false
      })
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

  // 选择头像（使用 wx.chooseImage 代替不支持的 wx.chooseAvatar）
  chooseAvatar() {
    console.log('选择头像')
    
    // 检查是否支持 wx.chooseAvatar
    if (wx.chooseAvatar) {
      wx.chooseAvatar({
        success: (res) => {
          console.log('选择头像成功:', res)
          this.updateAvatar(res.avatarUrl)
        },
        fail: (err) => {
          console.error('选择头像失败:', err)
          this.fallbackChooseImage()
        }
      })
    } else {
      // 使用 wx.chooseImage 作为备选方案
      this.fallbackChooseImage()
    }
  },

  // 备选方案：使用 wx.chooseImage
  fallbackChooseImage() {
    console.log('使用 wx.chooseImage 选择头像')
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择图片成功:', res)
        const tempFilePath = res.tempFilePaths[0]
        this.updateAvatar(tempFilePath)
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        if (!err.errMsg.includes('cancel')) {
          app.showToast('选择头像失败', 'error')
        }
      }
    })
  },

  // 更新头像
  updateAvatar(avatarUrl) {
    console.log('更新头像:', avatarUrl)
    
    // 更新患者头像
    const updatedPatientInfo = {
      ...this.data.patientInfo,
      avatarUrl: avatarUrl
    }
    
    // 更新用户头像
    const updatedUserInfo = {
      ...this.data.userInfo,
      avatarUrl: avatarUrl
    }
    
    // 立即更新页面显示
    this.setData({
      userInfo: updatedUserInfo,
      patientInfo: updatedPatientInfo
    })
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', updatedUserInfo)
    wx.setStorageSync('patientInfo', updatedPatientInfo)
    
    // 显示成功提示
    app.showToast('头像更新成功', 'success')
    
    // 刷新数据
    setTimeout(() => {
      this.loadUserData()
    }, 500)
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
    
    // 合并用户信息和患者信息
    const patientInfo = this.data.patientInfo || {}
    const userInfo = this.data.userInfo || {}
    
    // 计算年龄
    let age = patientInfo.age
    if (!age && patientInfo.birthDate) {
      const birthDate = new Date(patientInfo.birthDate)
      const now = new Date()
      age = now.getFullYear() - birthDate.getFullYear()
    }
    
    const editUserInfo = {
      name: patientInfo.name || userInfo.nickname || '',
      age: age || 65,
      gender: patientInfo.gender === 'male' ? '男' : (patientInfo.gender === 'female' ? '女' : ''),
      phone: patientInfo.phone || '',
      address: patientInfo.address || '',
      stomaType: patientInfo.stomaType || '结肠造口',
      surgeryDate: patientInfo.surgeryDate || '',
      surgeryHospital: patientInfo.surgeryHospital || '',
      primaryDisease: patientInfo.primaryDisease || ''
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
  async saveEdit() {
    const { editUserInfo } = this.data
    
    if (!editUserInfo.name || !editUserInfo.age || !editUserInfo.gender) {
      app.showToast('请填写完整信息', 'none')
      return
    }
    
    // 验证年龄
    const age = parseInt(editUserInfo.age)
    if (age < 1 || age > 120) {
      app.showToast('请输入正确的年龄', 'none')
      return
    }

    wx.showLoading({ title: '保存中...' })
    
    try {
      // 构建患者信息数据
      const patientData = {
        name: editUserInfo.name,
        gender: editUserInfo.gender === '男' ? 'male' : 'female',
        birthDate: this.calculateBirthDate(age),
        phone: editUserInfo.phone || '',
        address: editUserInfo.address || '',
        stomaType: editUserInfo.stomaType || '结肠造口',
        surgeryDate: editUserInfo.surgeryDate || new Date().toISOString().split('T')[0],
        surgeryHospital: editUserInfo.surgeryHospital || '',
        primaryDisease: editUserInfo.primaryDisease || ''
      }

      // 如果已有患者信息，则更新；否则创建
      let res
      const patientInfo = this.data.patientInfo
      if (patientInfo && patientInfo.id) {
        // 更新
        res = await api.updatePatient(patientInfo.id, patientData)
      } else {
        // 创建
        res = await api.createPatient(patientData)
      }
      
      if (res.success && res.data) {
        // 保存成功
        const updatedPatientInfo = res.data
        wx.setStorageSync('patientInfo', updatedPatientInfo)
        
        this.setData({
          patientInfo: updatedPatientInfo,
          showEditModal: false
        })
        
        wx.hideLoading()
        app.showToast('个人信息已更新', 'success')
      } else {
        throw new Error(res.message || '保存失败')
      }
    } catch (error) {
      console.error('保存编辑失败:', error)
      wx.hideLoading()
      
      // 如果后端失败，询问是否仅保存到本地
      wx.showModal({
        title: '提示',
        content: '无法同步至云端，是否仅保存到本地？',
        confirmText: '保存到本地',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.saveEditLocally()
          }
        }
      })
    }
  },

  // 计算出生日期
  calculateBirthDate(age) {
    const now = new Date()
    const birthYear = now.getFullYear() - age
    return `${birthYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  },

  // 仅保存到本地
  saveEditLocally() {
    try {
      const { editUserInfo } = this.data
      const age = parseInt(editUserInfo.age)
      
      const patientInfo = {
        ...this.data.patientInfo,
        name: editUserInfo.name,
        age: age,
        gender: editUserInfo.gender,
        phone: editUserInfo.phone || '',
        address: editUserInfo.address || '',
        localOnly: true
      }
      
      wx.setStorageSync('patientInfo', patientInfo)
      
      this.setData({
        patientInfo,
        showEditModal: false
      })
      
      app.showToast('已保存到本地', 'success')
    } catch (e) {
      console.error('保存到本地失败:', e)
      app.showToast('保存失败，请重试', 'none')
    }
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