// patient-app/pages/care-plan/care-plan.js
const app = getApp()

Page({
  data: {
    loading: true,
    currentTab: 'overview',
    carePlan: {
      basicInfo: {
        patientName: '张患者',
        age: 65,
        gender: '女',
        stomaType: '回肠造口',
        stomaDate: '2024-01-15',
        daysSince: 15,
        careLevel: '中级',
        nextReview: '2024-02-15'
      },
      dailyTasks: [
        {
          id: 1,
          title: '造口清洁',
          description: '使用生理盐水清洁造口周围皮肤',
          time: '08:00',
          duration: '15分钟',
          completed: true,
          priority: 'high',
          category: 'hygiene'
        },
        {
          id: 2,
          title: '造口袋更换',
          description: '更换造口袋，检查皮肤状况',
          time: '08:30',
          duration: '20分钟',
          completed: false,
          priority: 'high',
          category: 'care'
        },
        {
          id: 3,
          title: '症状记录',
          description: '记录今日症状和不适感',
          time: '12:00',
          duration: '5分钟',
          completed: false,
          priority: 'medium',
          category: 'monitoring'
        },
        {
          id: 4,
          title: '皮肤护理',
          description: '涂抹皮肤保护剂',
          time: '18:00',
          duration: '10分钟',
          completed: false,
          priority: 'medium',
          category: 'care'
        },
        {
          id: 5,
          title: '运动康复',
          description: '进行轻度康复运动',
          time: '19:00',
          duration: '30分钟',
          completed: false,
          priority: 'low',
          category: 'exercise'
        }
      ],
      weeklyGoals: [
        {
          id: 1,
          title: '皮肤状况改善',
          description: '保持造口周围皮肤健康',
          progress: 75,
          target: '100%',
          status: 'in-progress'
        },
        {
          id: 2,
          title: '疼痛控制',
          description: '将疼痛控制在2级以下',
          progress: 60,
          target: '≤2级',
          status: 'in-progress'
        },
        {
          id: 3,
          title: '营养均衡',
          description: '保持均衡的营养摄入',
          progress: 80,
          target: '100%',
          status: 'in-progress'
        },
        {
          id: 4,
          title: '心理适应',
          description: '保持良好的心理状态',
          progress: 90,
          target: '100%',
          status: 'completed'
        }
      ],
      monthlyReview: {
        lastReview: '2024-01-15',
        nextReview: '2024-02-15',
        doctorName: '李医生',
        department: '造口专科',
        phone: '010-12345678',
        notes: '患者恢复情况良好，建议继续当前护理方案'
      },
      careTips: [
        {
          id: 1,
          title: '造口清洁要点',
          content: '使用温水或生理盐水清洁，避免使用刺激性清洁剂',
          category: 'hygiene',
          priority: 'high'
        },
        {
          id: 2,
          title: '饮食注意事项',
          content: '避免高纤维食物，多饮水，保持大便通畅',
          category: 'diet',
          priority: 'medium'
        },
        {
          id: 3,
          title: '运动指导',
          content: '可进行轻度散步，避免剧烈运动和重体力劳动',
          category: 'exercise',
          priority: 'medium'
        },
        {
          id: 4,
          title: '心理支持',
          content: '保持积极心态，与家人朋友多交流',
          category: 'psychology',
          priority: 'low'
        }
      ]
    },
    todayProgress: 0,
    weeklyProgress: 0,
    monthlyProgress: 0
  },

  onLoad() {
    console.log('护理计划页面加载')
    this.loadCarePlan()
  },

  onShow() {
    console.log('护理计划页面显示')
  },

  // 加载护理计划数据
  loadCarePlan() {
    try {
      // 从本地存储加载数据
      const userInfo = wx.getStorageSync('userInfo') || this.data.carePlan.basicInfo
      const symptomRecords = wx.getStorageSync('symptomRecords') || []
      
      // 更新基本信息
      this.setData({
        'carePlan.basicInfo': {
          ...this.data.carePlan.basicInfo,
          ...userInfo
        }
      })
      
      // 计算进度
      this.calculateProgress()
      
      this.setData({
        loading: false
      })
      
      console.log('护理计划数据加载完成')
    } catch (e) {
      console.error('加载护理计划数据失败:', e)
      app.showToast('数据加载失败', 'error')
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 完成任务
  completeTask(e) {
    const taskId = e.currentTarget.dataset.id
    const { dailyTasks } = this.data.carePlan
    
    const updatedTasks = dailyTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed }
      }
      return task
    })
    
    this.setData({
      'carePlan.dailyTasks': updatedTasks
    })
    
    // 重新计算进度
    this.calculateProgress()
    
    // 保存到本地存储
    this.saveCarePlan()
    
    app.showToast('任务状态已更新', 'success')
  },

  // 计算进度
  calculateProgress() {
    const { dailyTasks, weeklyGoals } = this.data.carePlan
    
    // 计算今日进度
    const completedTasks = dailyTasks.filter(task => task.completed).length
    const todayProgress = dailyTasks.length > 0 ? Math.round((completedTasks / dailyTasks.length) * 100) : 0
    
    // 计算周进度
    const completedGoals = weeklyGoals.filter(goal => goal.status === 'completed').length
    const weeklyProgress = weeklyGoals.length > 0 ? Math.round((completedGoals / weeklyGoals.length) * 100) : 0
    
    // 计算月进度（模拟）
    const monthlyProgress = Math.round((todayProgress + weeklyProgress) / 2)
    
    this.setData({
      todayProgress,
      weeklyProgress,
      monthlyProgress
    })
  },

  // 保存护理计划
  saveCarePlan() {
    try {
      wx.setStorageSync('carePlan', this.data.carePlan)
      console.log('护理计划已保存')
    } catch (e) {
      console.error('保存护理计划失败:', e)
    }
  },

  // 添加任务
  addTask() {
    wx.showModal({
      title: '添加任务',
      content: '是否要添加新的护理任务？',
      success: (res) => {
        if (res.confirm) {
          app.showToast('添加任务功能开发中', 'none')
        }
      }
    })
  },

  // 编辑计划
  editPlan() {
    wx.showModal({
      title: '编辑计划',
      content: '是否要编辑护理计划？',
      success: (res) => {
        if (res.confirm) {
          app.showToast('编辑计划功能开发中', 'none')
        }
      }
    })
  },

  // 联系医生
  contactDoctor() {
    const { monthlyReview } = this.data.carePlan
    
    wx.showModal({
      title: '联系医生',
      content: `医生：${monthlyReview.doctorName}\n科室：${monthlyReview.department}\n电话：${monthlyReview.phone}`,
      confirmText: '拨打电话',
      success: (res) => {
        if (res.confirm) {
          // 模拟拨打电话
          app.showToast('正在拨打电话...', 'none')
        }
      }
    })
  },

  // 查看护理建议
  viewCareTips() {
    wx.showModal({
      title: '护理建议',
      content: '查看详细的护理建议和注意事项',
      confirmText: '查看详情',
      success: (res) => {
        if (res.confirm) {
          app.showToast('护理建议功能开发中', 'none')
        }
      }
    })
  },

  // 导出计划
  exportPlan() {
    app.showToast('计划导出功能开发中', 'none')
  },

  // 分享计划
  sharePlan() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的护理计划 - 造口护理患者端',
      path: '/pages/care-plan/care-plan'
    }
  }
}) 