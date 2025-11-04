// nurse-app/pages/dashboard/dashboard.js
const app = getApp()

Page({
  data: {
    nurseInfo: {
      name: '李护士',
      department: '造口护理科',
      title: '主管护师'
    },
    dashboardStats: {
      patients: 0,
      tasks: 0,
      assessments: 0,
      score: 0
    },
    recentPatients: [],
    pendingTasks: [],
    reminders: []
  },

  onLoad() {
    console.log('护士工作台加载')
    this.loadDashboardData()
  },

  onShow() {
    console.log('护士工作台显示')
    this.loadDashboardData()
  },

  // 加载工作台数据
  loadDashboardData() {
    this.loadNurseInfo()
    this.loadDashboardStats()
    this.loadRecentPatients()
    this.loadPendingTasks()
    this.loadReminders()
  },

  // 加载护士信息
  loadNurseInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({
          nurseInfo: userInfo
        })
      }
    } catch (e) {
      console.error('加载护士信息失败:', e)
    }
  },

  // 加载工作台统计
  loadDashboardStats() {
    try {
      const patients = wx.getStorageSync('patientList') || []
      const tasks = wx.getStorageSync('nurseTasks') || []
      const assessments = wx.getStorageSync('assessmentHistory') || []
      
      const today = new Date().toDateString()
      const todayAssessments = assessments.filter(record => 
        new Date(record.timestamp).toDateString() === today
      ).length
      
      const pendingTasks = tasks.filter(task => !task.completed).length
      const score = this.calculateNurseScore(patients, tasks)
      
      this.setData({
        dashboardStats: {
          patients: patients.length,
          tasks: pendingTasks,
          assessments: todayAssessments,
          score
        }
      })
    } catch (e) {
      console.error('加载工作台统计失败:', e)
    }
  },

  // 计算护士评分
  calculateNurseScore(patients, tasks) {
    if (patients.length === 0) return 85
    
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 1
    
    const baseScore = 60 + (completionRate * 40)
    return Math.round(baseScore)
  },

  // 加载最近患者
  loadRecentPatients() {
    try {
      const patients = wx.getStorageSync('patientList') || [
        {
          id: 'patient_001',
          name: '张患者',
          age: 65,
          gender: '女',
          careDays: 15,
          status: '正常'
        },
        {
          id: 'patient_002',
          name: '王患者',
          age: 58,
          gender: '男',
          careDays: 8,
          status: '需要关注'
        },
        {
          id: 'patient_003',
          name: '李患者',
          age: 72,
          gender: '女',
          careDays: 22,
          status: '正常'
        }
      ]
      
      this.setData({
        recentPatients: patients.slice(0, 5)
      })
    } catch (e) {
      console.error('加载最近患者失败:', e)
    }
  },

  // 加载待办任务
  loadPendingTasks() {
    try {
      const tasks = wx.getStorageSync('nurseTasks') || [
        {
          id: 'task_001',
          title: '患者随访',
          description: '对张患者进行定期随访，了解恢复情况',
          patientName: '张患者',
          priority: 'high',
          dueTime: '今天 14:00',
          completed: false
        },
        {
          id: 'task_002',
          title: '护理评估',
          description: '为王患者进行造口护理评估',
          patientName: '王患者',
          priority: 'medium',
          dueTime: '明天 09:00',
          completed: false
        },
        {
          id: 'task_003',
          title: '健康教育',
          description: '为李患者提供护理知识教育',
          patientName: '李患者',
          priority: 'low',
          dueTime: '后天 10:00',
          completed: false
        }
      ]
      
      this.setData({
        pendingTasks: tasks.filter(task => !task.completed)
      })
    } catch (e) {
      console.error('加载待办任务失败:', e)
    }
  },

  // 加载护理提醒
  loadReminders() {
    try {
      const reminders = wx.getStorageSync('nurseReminders') || [
        {
          id: 'reminder_001',
          title: '患者张患者需要更换造口袋',
          time: '09:30'
        },
        {
          id: 'reminder_002',
          title: '患者王患者症状记录异常',
          time: '14:00'
        }
      ]
      
      this.setData({ reminders })
    } catch (e) {
      console.error('加载护理提醒失败:', e)
    }
  },

  // 获取优先级文本
  getPriorityText(priority) {
    const priorityMap = {
      high: '高',
      medium: '中',
      low: '低'
    }
    return priorityMap[priority] || '未知'
  },

  // 查看全部患者
  viewAllPatients() {
    wx.switchTab({
      url: '/pages/patients/patients'
    })
  },

  // 查看患者详情
  viewPatientDetail(e) {
    const patientId = e.currentTarget.dataset.id
    console.log('查看患者详情:', patientId)
    app.showToast('患者详情功能开发中', 'none')
  },

  // 联系患者
  contactPatient(e) {
    const patientId = e.currentTarget.dataset.id
    console.log('联系患者:', patientId)
    app.showToast('联系功能开发中', 'none')
  },

  // 完成任务
  completeTask(e) {
    const taskId = e.currentTarget.dataset.id
    console.log('完成任务:', taskId)
    
    try {
      const tasks = wx.getStorageSync('nurseTasks') || []
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: true }
        }
        return task
      })
      
      wx.setStorageSync('nurseTasks', updatedTasks)
      this.loadPendingTasks()
      this.loadDashboardStats()
      
      app.showToast('任务已完成', 'success')
    } catch (e) {
      console.error('完成任务失败:', e)
      app.showToast('操作失败，请重试', 'error')
    }
  },

  // 查看任务详情
  viewTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id
    console.log('查看任务详情:', taskId)
    app.showToast('任务详情功能开发中', 'none')
  },

  // 关闭提醒
  dismissReminder(e) {
    const reminderId = e.currentTarget.dataset.id
    console.log('关闭提醒:', reminderId)
    
    try {
      const reminders = this.data.reminders.filter(reminder => reminder.id !== reminderId)
      wx.setStorageSync('nurseReminders', reminders)
      this.setData({ reminders })
      
      app.showToast('提醒已关闭', 'success')
    } catch (e) {
      console.error('关闭提醒失败:', e)
      app.showToast('操作失败，请重试', 'error')
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '工作台 - 造口护理护士端',
      path: '/pages/dashboard/dashboard'
    }
  }
}) 