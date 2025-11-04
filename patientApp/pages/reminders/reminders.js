// patient-app/pages/reminders/reminders.js
const app = getApp()

Page({
  data: {
    loading: true,
    currentTab: 'reminders',
    reminders: [
      {
        id: 1,
        title: '造口清洁提醒',
        description: '每日造口清洁护理',
        time: '08:00',
        enabled: true,
        repeat: 'daily',
        category: 'hygiene',
        categoryName: '清洁护理',
        icon: '🧼'
      },
      {
        id: 2,
        title: '造口袋更换提醒',
        description: '定期更换造口袋',
        time: '08:30',
        enabled: true,
        repeat: 'daily',
        category: 'care',
        categoryName: '护理操作',
        icon: '🔄'
      },
      {
        id: 3,
        title: '症状记录提醒',
        description: '记录每日症状和不适',
        time: '12:00',
        enabled: true,
        repeat: 'daily',
        category: 'monitoring',
        categoryName: '症状监测',
        icon: '📝'
      },
      {
        id: 4,
        title: '皮肤护理提醒',
        description: '涂抹皮肤保护剂',
        time: '18:00',
        enabled: true,
        repeat: 'daily',
        category: 'care',
        categoryName: '护理操作',
        icon: '🧴'
      },
      {
        id: 5,
        title: '运动康复提醒',
        description: '进行轻度康复运动',
        time: '19:00',
        enabled: false,
        repeat: 'daily',
        category: 'exercise',
        categoryName: '康复运动',
        icon: '🏃‍♀️'
      },
      {
        id: 6,
        title: '复查预约提醒',
        description: '定期复查预约',
        time: '09:00',
        enabled: true,
        repeat: 'weekly',
        category: 'medical',
        categoryName: '医疗相关',
        icon: '🏥'
      },
      {
        id: 7,
        title: '药物服用提醒',
        description: '按时服用药物',
        time: '08:00',
        enabled: true,
        repeat: 'daily',
        category: 'medication',
        categoryName: '药物管理',
        icon: '💊'
      },
      {
        id: 8,
        title: '水分补充提醒',
        description: '保持充足水分摄入',
        time: '10:00',
        enabled: false,
        repeat: 'daily',
        category: 'nutrition',
        categoryName: '营养补充',
        icon: '💧'
      }
    ],
    notificationSettings: {
      sound: true,
      vibration: true,
      popup: true,
      badge: true,
      silent: false
    },
    timeSettings: {
      startTime: '08:00',
      endTime: '22:00',
      quietHours: true
    },
    categories: [
      { id: 'hygiene', name: '清洁护理', color: '#3B82F6' },
      { id: 'care', name: '护理操作', color: '#10B981' },
      { id: 'monitoring', name: '症状监测', color: '#F59E0B' },
      { id: 'exercise', name: '康复运动', color: '#8B5CF6' },
      { id: 'medical', name: '医疗相关', color: '#EF4444' },
      { id: 'medication', name: '药物管理', color: '#EC4899' },
      { id: 'nutrition', name: '营养补充', color: '#F97316' }
    ]
  },

  onLoad() {
    console.log('提醒设置页面加载')
    this.loadReminderSettings()
  },

  onShow() {
    console.log('提醒设置页面显示')
  },

  // 加载提醒设置数据
  loadReminderSettings() {
    try {
      // 从本地存储加载数据
      const savedReminders = wx.getStorageSync('reminders') || this.data.reminders
      const savedNotificationSettings = wx.getStorageSync('notificationSettings') || this.data.notificationSettings
      const savedTimeSettings = wx.getStorageSync('timeSettings') || this.data.timeSettings
      
      // 为每个提醒添加分类名称
      const remindersWithCategoryName = savedReminders.map(reminder => {
        const category = this.data.categories.find(c => c.id === reminder.category)
        return {
          ...reminder,
          categoryName: category ? category.name : '其他'
        }
      })
      
      this.setData({
        reminders: remindersWithCategoryName,
        notificationSettings: savedNotificationSettings,
        timeSettings: savedTimeSettings,
        loading: false
      })
      
      console.log('提醒设置数据加载完成')
    } catch (e) {
      console.error('加载提醒设置数据失败:', e)
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

  // 切换提醒开关
  toggleReminder(e) {
    const reminderId = e.currentTarget.dataset.id
    const { reminders } = this.data
    
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === reminderId) {
        return { ...reminder, enabled: !reminder.enabled }
      }
      return reminder
    })
    
    this.setData({
      reminders: updatedReminders
    })
    
    // 保存到本地存储
    this.saveReminderSettings()
    
    // 如果开启提醒，请求通知权限
    const reminder = reminders.find(r => r.id === reminderId)
    if (reminder && !reminder.enabled) {
      this.requestNotificationPermission()
    }
    
    app.showToast(reminder.enabled ? '提醒已关闭' : '提醒已开启', 'success')
  },

  // 编辑提醒
  editReminder(e) {
    const reminderId = e.currentTarget.dataset.id
    console.log('编辑提醒:', reminderId)
    
    wx.showModal({
      title: '编辑提醒',
      content: '是否要编辑这个提醒？',
      success: (res) => {
        if (res.confirm) {
          app.showToast('编辑提醒功能开发中', 'none')
        }
      }
    })
  },

  // 删除提醒
  deleteReminder(e) {
    const reminderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '删除提醒',
      content: '确定要删除这个提醒吗？',
      success: (res) => {
        if (res.confirm) {
          const { reminders } = this.data
          const updatedReminders = reminders.filter(reminder => reminder.id !== reminderId)
          
          this.setData({
            reminders: updatedReminders
          })
          
          // 保存到本地存储
          this.saveReminderSettings()
          
          app.showToast('提醒已删除', 'success')
        }
      }
    })
  },

  // 添加提醒
  addReminder() {
    wx.showModal({
      title: '添加提醒',
      content: '是否要添加新的提醒？',
      success: (res) => {
        if (res.confirm) {
          app.showToast('添加提醒功能开发中', 'none')
        }
      }
    })
  },

  // 切换通知设置
  toggleNotificationSetting(e) {
    const setting = e.currentTarget.dataset.setting
    const { notificationSettings } = this.data
    
    this.setData({
      [`notificationSettings.${setting}`]: !notificationSettings[setting]
    })
    
    // 保存到本地存储
    this.saveNotificationSettings()
    
    app.showToast('设置已更新', 'success')
  },

  // 设置时间范围
  setTimeRange(e) {
    const type = e.currentTarget.dataset.type
    const { timeSettings } = this.data
    
    wx.showModal({
      title: '设置时间',
      content: '请输入时间（格式：HH:MM）',
      editable: true,
      placeholderText: '08:00',
      success: (res) => {
        if (res.confirm && res.content) {
          // 简单的时间格式验证
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
          if (timeRegex.test(res.content)) {
            this.setData({
              [`timeSettings.${type}`]: res.content
            })
            
            // 保存到本地存储
            this.saveTimeSettings()
            
            app.showToast('时间设置已更新', 'success')
          } else {
            app.showToast('时间格式错误，请使用HH:MM格式', 'error')
          }
        }
      }
    })
  },

  // 切换静音时段
  toggleQuietHours() {
    const { timeSettings } = this.data
    
    this.setData({
      'timeSettings.quietHours': !timeSettings.quietHours
    })
    
    // 保存到本地存储
    this.saveTimeSettings()
    
    app.showToast(timeSettings.quietHours ? '静音时段已关闭' : '静音时段已开启', 'success')
  },

  // 请求通知权限
  requestNotificationPermission() {
    wx.requestSubscribeMessage({
      tmplIds: ['template_id_1', 'template_id_2'],
      success: (res) => {
        console.log('通知权限请求成功:', res)
        app.showToast('通知权限已获取', 'success')
      },
      fail: (err) => {
        console.error('通知权限请求失败:', err)
        app.showToast('通知权限获取失败', 'error')
      }
    })
  },

  // 测试提醒
  testReminder() {
    wx.showModal({
      title: '测试提醒',
      content: '是否要发送测试提醒？',
      success: (res) => {
        if (res.confirm) {
          // 模拟发送提醒
          wx.showToast({
            title: '测试提醒已发送',
            icon: 'success',
            duration: 2000
          })
          
          // 震动提醒
          if (this.data.notificationSettings.vibration) {
            wx.vibrateShort()
          }
        }
      }
    })
  },

  // 保存提醒设置
  saveReminderSettings() {
    try {
      wx.setStorageSync('reminders', this.data.reminders)
      console.log('提醒设置已保存')
    } catch (e) {
      console.error('保存提醒设置失败:', e)
    }
  },

  // 保存通知设置
  saveNotificationSettings() {
    try {
      wx.setStorageSync('notificationSettings', this.data.notificationSettings)
      console.log('通知设置已保存')
    } catch (e) {
      console.error('保存通知设置失败:', e)
    }
  },

  // 保存时间设置
  saveTimeSettings() {
    try {
      wx.setStorageSync('timeSettings', this.data.timeSettings)
      console.log('时间设置已保存')
    } catch (e) {
      console.error('保存时间设置失败:', e)
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '提醒设置 - 造口护理患者端',
      path: '/pages/reminders/reminders'
    }
  }
}) 