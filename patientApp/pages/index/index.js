// patient-app/pages/index/index.js
const app = getApp()
const api = require('../../utils/api.js')
import { getCurrentDate, formatDateISO } from '../../utils/dateFormat.js'

Page({
  data: {
    isLoggedIn: false,
    todayDate: '',
    patientInfo: null,
    todayStats: {
      assessments: 0,
      records: 0,
      lessons: 0,
      score: 85
    },
    recentRecords: [],
    reminders: [],
    isLoading: false
  },

  onLoad() {
    console.log('患者端首页加载')
    this.checkLoginStatus()
  },

  onShow() {
    console.log('患者端首页显示')
    
    // 检查是否需要刷新数据
    const needRefresh = getApp().globalData.needRefreshIndex
    if (needRefresh) {
      console.log('检测到需要刷新首页数据，清除缓存')
      getApp().globalData.needRefreshIndex = false
      // 清除今日统计缓存，强制从后端重新获取
      wx.removeStorageSync('todayStats')
    }
    
    this.checkLoginStatus()
    
    // 如果已登录，刷新数据（每次都刷新以确保数据最新）
    if (this.data.isLoggedIn) {
      this.loadPageData()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token')
      
      if (token) {
        // 已登录，验证token有效性
        app.globalData.token = token
        this.setData({ isLoggedIn: true })
        this.verifyToken()
      } else {
        // 未登录，显示登录界面
        this.setData({ isLoggedIn: false })
      }
    } catch (e) {
      console.error('检查登录状态失败:', e)
      this.setData({ isLoggedIn: false })
    }
  },

  // 验证token有效性
  async verifyToken() {
    try {
      const res = await api.getCurrentUser()
      if (res.success) {
        // token有效，保存用户信息
        app.globalData.userInfo = res.data
        wx.setStorageSync('userInfo', res.data)
        this.loadPageData()
      }
    } catch (error) {
      console.error('验证token失败:', error)
      
      // 只有在明确的401错误时才清除登录信息
      // 其他错误（如网络问题）保留登录状态
      if (error.statusCode === 401) {
        console.log('Token已过期或无效，清除登录信息')
        this.clearLoginInfo()
      } else {
        console.log('验证失败但保留登录状态，可能是网络问题')
        // 使用本地缓存的用户信息
        const localUserInfo = wx.getStorageSync('userInfo')
        if (localUserInfo) {
          app.globalData.userInfo = localUserInfo
        }
        // 继续加载页面数据（使用缓存）
        this.loadPageData()
      }
    }
  },

  // 清除登录信息
  clearLoginInfo() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('patientInfo')
    app.globalData.token = null
    app.globalData.userInfo = null
    this.setData({ isLoggedIn: false })
  },

  // 微信登录
  async wechatLogin() {
    if (this.data.isLoading) {
      return
    }

    this.setData({ isLoading: true })
    
    // 使用标记来跟踪是否显示了loading
    let loadingShown = false
    
    try {
      wx.showLoading({ title: '登录中...' })
      loadingShown = true

      // 1. 获取微信登录code
      const loginRes = await wx.login()
      if (!loginRes.code) {
        throw new Error('获取微信登录code失败')
      }

      console.log('微信登录code:', loginRes.code)

      // 2. 获取用户信息（如果支持getUserProfile）
      let userInfo = null
      if (wx.getUserProfile) {
        try {
          const profileRes = await wx.getUserProfile({
            desc: '用于完善用户资料'
          })
          userInfo = profileRes.userInfo
        } catch (e) {
          console.log('用户取消授权或获取失败，使用默认信息')
        }
      }

      // 3. 调用后端登录接口
      const loginData = {
        code: loginRes.code,
        userInfo: userInfo || {
          nickname: '微信用户',
          avatarUrl: '',
          gender: 0
        }
      }

      const res = await api.loginWithWechat(loginRes.code, loginData.userInfo)
      
      if (res.success) {
        // 登录成功，保存token和用户信息
        const token = res.data.token
        const user = res.data.user
        const patient = res.data.patient

        wx.setStorageSync('token', token)
        wx.setStorageSync('userInfo', user)
        if (patient) {
          wx.setStorageSync('patientInfo', patient)
        }

        app.globalData.token = token
        app.globalData.userInfo = user

        this.setData({ 
          isLoggedIn: true,
          patientInfo: patient
        })

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 加载页面数据
        this.loadPageData()
      } else {
        throw new Error(res.message || '登录失败')
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      wx.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      // 只有在显示了loading的情况下才隐藏
      if (loadingShown) {
        wx.hideLoading()
      }
      this.setData({ isLoading: false })
    }
  },

  // 加载页面数据
  async loadPageData() {
    this.initTodayDate()
    await this.loadPatientInfo()
    await this.loadTodayStats()
    await this.loadRecentRecords()
    await this.loadReminders()
  },

  // 初始化今日日期
  initTodayDate() {
    // 使用统一的时间格式化函数
    const todayDate = getCurrentDate()
    
    this.setData({
      todayDate
    })
  },

  // 加载患者信息
  async loadPatientInfo() {
    try {
      // 先尝试从本地获取并立即显示
      let patientInfo = wx.getStorageSync('patientInfo')
      if (patientInfo) {
        this.setData({ patientInfo })
        console.log('使用本地缓存的患者信息')
      }
      
      // 后台从后端获取最新信息
      try {
        const res = await api.getMyPatient()
        if (res.success && res.data) {
          patientInfo = res.data
          wx.setStorageSync('patientInfo', patientInfo)
          this.setData({ patientInfo })
          console.log('已更新患者信息')
        }
      } catch (error) {
        console.log('获取患者信息失败，继续使用本地缓存:', error)
        // 即使网络请求失败，只要有本地缓存就继续使用
        if (!patientInfo) {
          // 完全没有数据时才显示错误
          console.error('无法加载患者信息，且没有本地缓存')
        }
      }
    } catch (e) {
      console.error('加载患者信息失败:', e)
    }
  },

  // 加载今日统计
  async loadTodayStats() {
    try {
      // 先从本地缓存加载上次的数据
      const cachedStats = wx.getStorageSync('todayStats')
      if (cachedStats) {
        this.setData({ todayStats: cachedStats })
        console.log('使用缓存的统计数据')
      }
      
      const today = new Date()
      // 使用 YYYY-MM-DD 格式，与后端保持一致
      const todayDateStr = formatDateISO(today)
      
      let todayAssessments = 0
      let todayRecords = 0
      let todayLessons = 0
      let score = cachedStats ? cachedStats.score : 85
      
      console.log('查询今日数据，日期:', todayDateStr)
      
      // 从后端获取今日评估数
      try {
        const assessRes = await api.getAssessments({
          startDate: todayDateStr,
          endDate: todayDateStr,
          pageSize: 100
        })
        console.log('今日评估响应:', assessRes)
        console.log('今日评估数据:', assessRes.data)
        console.log('今日评估分页信息:', assessRes.pagination)
        if (assessRes.success && assessRes.data) {
          // 优先使用 pagination.total，如果没有则使用数组长度
          if (assessRes.pagination && typeof assessRes.pagination.total === 'number') {
            todayAssessments = assessRes.pagination.total
          } else if (Array.isArray(assessRes.data)) {
            todayAssessments = assessRes.data.length
          } else {
            todayAssessments = 0
          }
          console.log('今日评估数量:', todayAssessments)
        }
      } catch (error) {
        console.log('获取今日评估失败，使用缓存数据:', error)
        todayAssessments = cachedStats ? cachedStats.assessments : 0
      }
      
      // 从后端获取今日日记数
      try {
        const diaryRes = await api.getDiaries({
          startDate: todayDateStr,
          endDate: todayDateStr,
          pageSize: 100
        })
        console.log('今日日记响应:', diaryRes)
        if (diaryRes.success && diaryRes.data) {
          todayRecords = Array.isArray(diaryRes.data) ? diaryRes.data.length : diaryRes.pagination?.total || 0
        }
      } catch (error) {
        console.log('获取今日日记失败，使用缓存数据:', error)
        todayRecords = cachedStats ? cachedStats.records : 0
      }
      
      // 从后端获取学习记录
      try {
        const learningRes = await api.getMyLearning()
        if (learningRes.success && learningRes.data) {
          const learningData = learningRes.data
          todayLessons = Array.isArray(learningData) ? learningData.filter(item => {
            return new Date(item.updatedAt).toDateString() === today.toDateString()
          }).length : 0
        }
      } catch (error) {
        console.log('获取学习记录失败，使用缓存数据:', error)
        todayLessons = cachedStats ? cachedStats.lessons : 0
      }
      
      // 获取健康评分
      try {
        const reportRes = await api.getMyReport({ days: 7 })
        if (reportRes.success && reportRes.data) {
          score = reportRes.data.healthScore || 85
        }
      } catch (error) {
        console.log('获取健康评分失败，使用缓存数据:', error)
      }
      
      const newStats = {
        assessments: todayAssessments,
        records: todayRecords,
        lessons: todayLessons,
        score
      }
      
      // 更新显示和缓存
      this.setData({ todayStats: newStats })
      wx.setStorageSync('todayStats', newStats)
      console.log('已更新统计数据')
    } catch (e) {
      console.error('加载今日统计失败:', e)
      // 出错时继续使用缓存数据
      const cachedStats = wx.getStorageSync('todayStats')
      if (cachedStats) {
        this.setData({ todayStats: cachedStats })
      }
    }
  },

  // 计算健康评分
  calculateHealthScore(records) {
    if (records.length === 0) return 85
    
    const avgPain = records.reduce((sum, r) => sum + r.painLevel, 0) / records.length
    const baseScore = 100 - (avgPain - 1) * 10
    
    return Math.max(60, Math.min(100, Math.round(baseScore)))
  },

  // 加载最近记录
  async loadRecentRecords() {
    try {
      const allRecords = []
      
      // 获取最近评估记录
      try {
        const assessRes = await api.getAssessments({ page: 1, pageSize: 5 })
        if (assessRes.success && assessRes.data) {
          const assessments = Array.isArray(assessRes.data) ? assessRes.data : []
          assessments.forEach(record => {
            allRecords.push({
              ...record,
              type: 'assessment',
              title: 'AI评估',
              description: `风险等级: ${record.riskLevel || '未知'}`,
              time: record.createdAt,
              timestamp: new Date(record.createdAt).getTime()
            })
          })
        }
      } catch (error) {
        console.log('获取评估记录失败:', error)
      }
      
      // 获取最近日记记录
      try {
        const diaryRes = await api.getDiaries({ page: 1, pageSize: 5 })
        if (diaryRes.success && diaryRes.data) {
          const diaries = Array.isArray(diaryRes.data) ? diaryRes.data : []
          diaries.forEach(record => {
            allRecords.push({
              ...record,
              type: 'diary',
              title: '症状日记',
              description: `疼痛等级: ${record.painLevel || 0}/5`,
              time: record.diaryDate,
              timestamp: new Date(record.diaryDate).getTime()
            })
          })
        }
      } catch (error) {
        console.log('获取日记记录失败:', error)
      }
      
      // 排序并取前5条
      allRecords.sort((a, b) => b.timestamp - a.timestamp)
      
      this.setData({
        recentRecords: allRecords.slice(0, 5)
      })
    } catch (e) {
      console.error('加载最近记录失败:', e)
    }
  },

  // 加载护理提醒
  async loadReminders() {
    try {
      // 从后端获取今日提醒
      const res = await api.getTodayReminders()
      if (res.success && res.data) {
        const reminders = res.data.map(reminder => ({
          id: reminder.id,
          title: reminder.title,
          time: reminder.remindTime,
          completed: reminder.completed || false,
          description: reminder.description
        }))
        this.setData({ reminders })
      }
    } catch (error) {
      console.log('获取今日提醒失败，使用默认数据:', error)
      // 使用默认提醒
      this.setData({
        reminders: [
          {
            id: 'default_001',
            title: '更换造口袋',
            time: '09:00',
            completed: false
          },
          {
            id: 'default_002',
            title: '记录症状',
            time: '14:00',
            completed: false
          }
        ]
      })
    }
  },

  // 跳转到AI评估
  goToCamera() {
    wx.switchTab({
      url: '/pages/camera/camera'
    })
  },

  // 跳转到症状日记
  goToDiary() {
    wx.switchTab({
      url: '/pages/diary/diary'
    })
  },

  // 跳转到护理教育
  goToEducation() {
    wx.switchTab({
      url: '/pages/education/education'
    })
  },

  // 跳转到个人中心
  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 完成提醒
  async completeReminder(e) {
    const reminderId = e.currentTarget.dataset.id
    console.log('完成提醒:', reminderId)
    
    try {
      // 如果是默认提醒（ID以default_开头），只更新本地状态
      if (reminderId.toString().startsWith('default_')) {
        const reminders = this.data.reminders.map(reminder => {
          if (reminder.id === reminderId) {
            return { ...reminder, completed: true }
          }
          return reminder
        })
        this.setData({ reminders })
        app.showToast('提醒已完成', 'success')
        return
      }
      
      // 调用后端API完成提醒
      const res = await api.completeReminder(reminderId)
      if (res.success) {
        // 更新本地状态
        const reminders = this.data.reminders.map(reminder => {
          if (reminder.id === reminderId) {
            return { ...reminder, completed: true }
          }
          return reminder
        })
        this.setData({ reminders })
        app.showToast('提醒已完成', 'success')
      }
    } catch (error) {
      console.error('完成提醒失败:', error)
      app.showToast('操作失败，请重试', 'none')
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '造口护理患者端',
      path: '/pages/index/index'
    }
  }
})