// patient-app/pages/reminders/reminders.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    loading: true,
    useBackendData: true,
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
  async loadReminderSettings() {
    if (this.data.useBackendData) {
      await this.loadFromBackend()
    } else {
      this.loadFromLocal()
    }
  },

  // 从后端加载提醒
  async loadFromBackend() {
    try {
      const res = await api.getReminders()
      if (res.success && res.data) {
        const backendReminders = Array.isArray(res.data) ? res.data : []
        const reminders = backendReminders.map(reminder => {
          // 将数据库的 reminder_type 映射回前端 category
          const dbReminderType = reminder.reminderType || reminder.reminder_type || 'custom'
          const category = this.mapReminderTypeToCategory(dbReminderType)
          
          return {
            id: reminder.id,
            title: reminder.title,
            description: reminder.description || '',
            time: reminder.remindTime || reminder.remind_time,
            enabled: reminder.enabled === 1,
            repeat: reminder.frequency || 'daily',
            category: category,
            categoryName: this.getCategoryName(category),
            icon: this.getCategoryIcon(category),
            rawData: reminder
          }
        })
        
        this.setData({
          reminders,
          loading: false
        })
      }
      console.log('提醒从后端加载完成')
    } catch (error) {
      console.error('从后端加载提醒失败:', error)
      this.loadFromLocal()
    }
  },

  // 从本地加载提醒
  loadFromLocal() {
    try {
      const savedReminders = wx.getStorageSync('reminders') || this.data.reminders
      const savedNotificationSettings = wx.getStorageSync('notificationSettings') || this.data.notificationSettings
      const savedTimeSettings = wx.getStorageSync('timeSettings') || this.data.timeSettings
      
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
      app.showToast('数据加载失败', 'none')
    }
  },

  // 获取分类名称
  getCategoryName(type) {
    const category = this.data.categories.find(c => c.id === type)
    return category ? category.name : '其他'
  },

  // 获取分类图标
  getCategoryIcon(type) {
    const icons = {
      hygiene: '🧼',
      care: '🔄',
      monitoring: '📝',
      exercise: '🏃‍♀️',
      medical: '🏥',
      medication: '💊',
      nutrition: '💧',
      // 数据库支持的类型
      bag_change: '🔄',
      checkup: '🏥',
      diet: '🍎',
      custom: '⏰'
    }
    return icons[type] || '⏰'
  },

  // 将前端分类映射到数据库支持的 reminder_type 枚举值
  // 数据库支持: medication, bag_change, checkup, exercise, diet, custom
  mapCategoryToReminderType(category) {
    const mapping = {
      'hygiene': 'bag_change',    // 清洁护理 -> 造口袋更换
      'care': 'bag_change',        // 护理操作 -> 造口袋更换
      'monitoring': 'checkup',     // 症状监测 -> 复查
      'exercise': 'exercise',      // 康复运动 -> 运动
      'medical': 'checkup',        // 医疗相关 -> 复查
      'medication': 'medication',  // 药物管理 -> 药物
      'nutrition': 'diet'          // 营养补充 -> 饮食
    }
    return mapping[category] || 'custom' // 默认返回 custom（自定义）
  },

  // 将数据库的 reminder_type 反向映射回前端分类
  mapReminderTypeToCategory(reminderType) {
    const mapping = {
      'medication': 'medication',
      'bag_change': 'care',
      'checkup': 'medical',
      'exercise': 'exercise',
      'diet': 'nutrition',
      'custom': 'care'
    }
    return mapping[reminderType] || 'care'
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 切换提醒开关
  async toggleReminder(e) {
    const reminderId = e.currentTarget.dataset.id
    const { reminders } = this.data
    
    const reminder = reminders.find(r => r.id === reminderId)
    if (!reminder) return
    
    const newEnabledState = !reminder.enabled
    
    // 如果使用后端数据，先同步到后端
    if (this.data.useBackendData && reminder.rawData) {
      try {
        await api.updateReminder(reminderId, {
          enabled: newEnabledState ? 1 : 0
        })
        console.log('提醒状态已同步到后端')
      } catch (error) {
        console.error('同步提醒状态到后端失败:', error)
        wx.showToast({
          title: '同步失败，仅保存到本地',
          icon: 'none',
          duration: 2000
        })
      }
    }
    
    // 更新本地数据
    const updatedReminders = reminders.map(r => {
      if (r.id === reminderId) {
        return { ...r, enabled: newEnabledState }
      }
      return r
    })
    
    this.setData({
      reminders: updatedReminders
    })
    
    // 保存到本地存储
    this.saveReminderSettings()
    
    // 如果开启提醒，请求通知权限
    if (newEnabledState) {
      this.requestNotificationPermission()
    }
    
    app.showToast(newEnabledState ? '提醒已开启' : '提醒已关闭', 'success')
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
      success: async (res) => {
        if (res.confirm) {
          await this.confirmDeleteReminder(reminderId)
        }
      }
    })
  },

  // 确认删除提醒
  async confirmDeleteReminder(reminderId) {
    const { reminders } = this.data
    const reminder = reminders.find(r => r.id === reminderId)
    
    // 如果使用后端数据且有原始数据，先从后端删除
    if (this.data.useBackendData && reminder && reminder.rawData) {
      try {
        await api.deleteReminder(reminderId)
        console.log('提醒已从后端删除')
      } catch (error) {
        console.error('从后端删除提醒失败:', error)
        wx.showModal({
          title: '删除失败',
          content: '从服务器删除失败，是否仅删除本地数据？',
          success: (res) => {
            if (!res.confirm) {
              return
            }
            // 继续删除本地数据
            this.deleteLocalReminder(reminderId)
          }
        })
        return
      }
    }
    
    // 删除本地数据
    this.deleteLocalReminder(reminderId)
  },

  // 删除本地提醒数据
  deleteLocalReminder(reminderId) {
    const { reminders } = this.data
    const updatedReminders = reminders.filter(reminder => reminder.id !== reminderId)
    
    this.setData({
      reminders: updatedReminders
    })
    
    // 保存到本地存储
    this.saveReminderSettings()
    
    app.showToast('提醒已删除', 'success')
  },

  // 添加提醒
  addReminder() {
    // 跳转到添加提醒页面（可以在后续开发中实现）
    // wx.navigateTo({
    //   url: '/pages/reminders/add-reminder/add-reminder'
    // })
    
    // 临时实现：显示对话框收集基本信息
    wx.showModal({
      title: '添加提醒',
      content: '请输入提醒标题',
      editable: true,
      placeholderText: '例如：服药提醒',
      success: async (res) => {
        if (res.confirm && res.content) {
          await this.createNewReminder(res.content)
        }
      }
    })
  },

  // 创建新提醒
  async createNewReminder(title) {
    try {
      // 使用数据库支持的提醒类型（medication, bag_change, checkup, exercise, diet, custom）
      const newReminderData = {
        title: title,
        description: '',
        reminderType: 'custom', // 改为 'custom' 自定义类型，数据库支持的枚举值
        remindTime: '08:00',
        frequency: 'daily',
        enabled: 1
      }
      
      // 如果使用后端数据，先同步到后端
      if (this.data.useBackendData) {
        try {
          wx.showLoading({ title: '创建中...' })
          const res = await api.createReminder(newReminderData)
          wx.hideLoading()
          
          if (res.success && res.data) {
            // 添加后端返回的提醒到列表
            const newReminder = {
              id: res.data.id,
              title: res.data.title,
              description: res.data.description || '',
              time: res.data.remindTime || res.data.remind_time,
              enabled: res.data.enabled === 1,
              repeat: res.data.frequency || 'daily',
              category: res.data.reminderType || res.data.reminder_type || 'care',
              categoryName: this.getCategoryName(res.data.reminderType || res.data.reminder_type),
              icon: this.getCategoryIcon(res.data.reminderType || res.data.reminder_type),
              rawData: res.data
            }
            
            const updatedReminders = [newReminder, ...this.data.reminders]
            this.setData({ reminders: updatedReminders })
            
            // 同时保存到本地
            this.saveReminderSettings()
            
            console.log('提醒已同步到后端')
            app.showToast('提醒创建成功', 'success')
            return
          }
        } catch (error) {
          console.error('创建提醒到后端失败:', error)
          wx.hideLoading()
          wx.showToast({
            title: '创建失败，请重试',
            icon: 'none',
            duration: 2000
          })
          return
        }
      }
      
      // 仅添加到本地
      const newReminder = {
        id: Date.now(),
        title: title,
        description: '',
        time: '08:00',
        enabled: true,
        repeat: 'daily',
        category: 'care',
        categoryName: '护理操作',
        icon: '⏰'
      }
      
      const updatedReminders = [newReminder, ...this.data.reminders]
      this.setData({ reminders: updatedReminders })
      this.saveReminderSettings()
      
      app.showToast('提醒已添加到本地', 'success')
    } catch (error) {
      console.error('创建提醒失败:', error)
      app.showToast('创建提醒失败', 'error')
    }
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