// patient-app/pages/index/index.js
const app = getApp()
import { getCurrentDate } from '../../utils/dateFormat.js'

Page({
  data: {
    isLoggedIn: false,
    todayDate: '',
    patientInfo: {
      name: '张患者',
      age: 65,
      gender: '女',
      careDays: 15
    },
    todayStats: {
      assessments: 0,
      records: 0,
      lessons: 0,
      score: 85
    },
    recentRecords: [],
    reminders: []
  },

  onLoad() {
    console.log('患者端首页加载')
    this.checkLoginStatus()
  },

  onShow() {
    console.log('患者端首页显示')
    this.checkLoginStatus()
    
    // 如果已登录，确保用户信息是最新的
    if (this.data.isLoggedIn) {
      this.loadPatientInfo()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const token = wx.getStorageSync('token')
      
      if (userInfo && token) {
        // 已登录，加载数据
        this.setData({ isLoggedIn: true })
        this.loadPageData()
      } else {
        // 未登录，显示登录界面
        this.setData({ isLoggedIn: false })
        this.showLoginUI()
      }
    } catch (e) {
      console.error('检查登录状态失败:', e)
      this.setData({ isLoggedIn: false })
      this.showLoginUI()
    }
  },

  // 显示登录界面
  showLoginUI() {
    // 这里可以显示一个简单的登录提示
    // 在实际应用中，可能需要跳转到专门的登录页面
    wx.showModal({
      title: '欢迎使用',
      content: '造口护理患者端，请点击确定开始使用',
      showCancel: false,
      success: () => {
        // 模拟登录成功
        this.simulateLogin()
      }
    })
  },

  // 模拟登录
  simulateLogin() {
    // 检查是否已有用户信息（包括微信获取的信息）
    const existingUserInfo = wx.getStorageSync('userInfo')
    
    let mockUserInfo
    if (existingUserInfo) {
      // 如果已有用户信息，使用现有的
      mockUserInfo = existingUserInfo
    } else {
      // 否则使用默认信息
      mockUserInfo = {
        name: '张患者',
        age: 65,
        gender: '女',
        careDays: 15,
        nickName: '', // 微信昵称
        avatarUrl: '' // 微信头像
      }
    }
    
    try {
      wx.setStorageSync('userInfo', mockUserInfo)
      wx.setStorageSync('token', 'mock_token_' + Date.now())
      
      this.setData({ isLoggedIn: true })
      this.loadPageData()
      
      app.showToast('登录成功', 'success')
    } catch (e) {
      console.error('模拟登录失败:', e)
      app.showToast('登录失败，请重试', 'error')
    }
  },

  // 加载页面数据
  loadPageData() {
    this.initTodayDate()
    this.loadPatientInfo()
    this.loadTodayStats()
    this.loadRecentRecords()
    this.loadReminders()
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
  loadPatientInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        // 优先显示微信昵称，如果没有则显示手动输入的姓名
        const patientInfo = {
          ...userInfo,
          // 优先使用微信昵称，如果没有则使用手动输入的姓名
          displayName: userInfo.nickName || userInfo.name
        }
        
        console.log('首页加载患者信息:', patientInfo)
        
        this.setData({
          patientInfo: patientInfo
        })
      }
    } catch (e) {
      console.error('加载患者信息失败:', e)
    }
  },

  // 加载今日统计
  loadTodayStats() {
    try {
      const today = new Date().toDateString()
      const assessmentHistory = wx.getStorageSync('assessmentHistory') || []
      const symptomRecords = wx.getStorageSync('symptomRecords') || []
      const learningData = wx.getStorageSync('learningData') || { courses: [] }
      
      // 计算今日数据
      const todayAssessments = assessmentHistory.filter(record => 
        new Date(record.timestamp).toDateString() === today
      ).length
      
      const todayRecords = symptomRecords.filter(record => 
        new Date(record.timestamp).toDateString() === today
      ).length
      
      const todayLessons = learningData.courses.filter(course => 
        new Date(course.lastStudyTime).toDateString() === today
      ).length
      
      const score = this.calculateHealthScore(symptomRecords)
      
      this.setData({
        todayStats: {
          assessments: todayAssessments,
          records: todayRecords,
          lessons: todayLessons,
          score
        }
      })
    } catch (e) {
      console.error('加载今日统计失败:', e)
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
  loadRecentRecords() {
    try {
      const assessmentHistory = wx.getStorageSync('assessmentHistory') || []
      const symptomRecords = wx.getStorageSync('symptomRecords') || []
      
      // 合并并排序记录
      const allRecords = [
        ...assessmentHistory.map(record => ({
          ...record,
          type: 'assessment',
          title: 'AI评估',
          description: `评分: ${record.score}分 - ${record.levelText}`,
          time: record.time
        })),
        ...symptomRecords.map(record => ({
          ...record,
          type: 'diary',
          title: '症状记录',
          description: `疼痛等级: ${record.painLevel}/5`,
          time: record.date
        }))
      ].sort((a, b) => new Date(b.timestamp || b.time) - new Date(a.timestamp || a.time))
      
      this.setData({
        recentRecords: allRecords.slice(0, 5)
      })
    } catch (e) {
      console.error('加载最近记录失败:', e)
    }
  },

  // 加载护理提醒
  loadReminders() {
    try {
      const reminders = wx.getStorageSync('careReminders') || [
        {
          id: 'reminder_001',
          title: '更换造口袋',
          time: '09:00',
          completed: false
        },
        {
          id: 'reminder_002',
          title: '记录症状',
          time: '14:00',
          completed: false
        },
        {
          id: 'reminder_003',
          title: '学习护理知识',
          time: '16:00',
          completed: false
        }
      ]
      
      this.setData({ reminders })
    } catch (e) {
      console.error('加载护理提醒失败:', e)
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
  completeReminder(e) {
    const reminderId = e.currentTarget.dataset.id
    console.log('完成提醒:', reminderId)
    
    try {
      const reminders = this.data.reminders.map(reminder => {
        if (reminder.id === reminderId) {
          return { ...reminder, completed: true }
        }
        return reminder
      })
      
      wx.setStorageSync('careReminders', reminders)
      this.setData({ reminders })
      
      app.showToast('提醒已完成', 'success')
    } catch (e) {
      console.error('完成提醒失败:', e)
      app.showToast('操作失败，请重试', 'error')
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