// patient-app/pages/privacy/privacy.js
const app = getApp()

Page({
  data: {
    // 隐私设置数据
    privacySettings: {
      // 数据收集设置
      healthData: true,           // 健康数据收集
      usageAnalytics: true,       // 使用行为分析
      location: false,            // 位置信息
      
      // 账号安全设置
      biometric: false,           // 生物识别登录
      autoLock: true,             // 自动锁定
      
      // 通知设置
      careReminders: true,        // 护理提醒
      healthReports: true,        // 健康报告
      learningReminders: true     // 学习提醒
    }
  },

  onLoad() {
    console.log('隐私设置页面加载')
    this.loadPrivacySettings()
  },

  onShow() {
    console.log('隐私设置页面显示')
  },

  // 加载隐私设置
  loadPrivacySettings() {
    try {
      // 从本地存储加载隐私设置
      const savedSettings = wx.getStorageSync('privacySettings')
      if (savedSettings) {
        this.setData({
          privacySettings: { ...this.data.privacySettings, ...savedSettings }
        })
      }
    } catch (e) {
      console.error('加载隐私设置失败:', e)
    }
  },

  // 切换健康数据收集
  toggleHealthData(e) {
    const value = e.detail.value
    console.log('切换健康数据收集:', value)
    
    this.setData({
      'privacySettings.healthData': value
    })
    
    // 如果关闭健康数据收集，显示提示
    if (!value) {
      wx.showModal({
        title: '提示',
        content: '关闭健康数据收集可能影响护理计划的准确性，确定要关闭吗？',
        success: (res) => {
          if (!res.confirm) {
            // 用户取消，恢复开关状态
            this.setData({
              'privacySettings.healthData': true
            })
          }
        }
      })
    }
  },

  // 切换使用行为分析
  toggleUsageAnalytics(e) {
    const value = e.detail.value
    console.log('切换使用行为分析:', value)
    
    this.setData({
      'privacySettings.usageAnalytics': value
    })
  },

  // 切换位置信息
  toggleLocation(e) {
    const value = e.detail.value
    console.log('切换位置信息:', value)
    
    if (value) {
      // 请求位置权限
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success: () => {
                this.setData({
                  'privacySettings.location': true
                })
                app.showToast('位置权限已开启', 'success')
              },
              fail: () => {
                app.showToast('需要位置权限才能开启此功能', 'error')
                this.setData({
                  'privacySettings.location': false
                })
              }
            })
          } else {
            this.setData({
              'privacySettings.location': true
            })
          }
        }
      })
    } else {
      this.setData({
        'privacySettings.location': false
      })
    }
  },

  // 切换生物识别登录
  toggleBiometric(e) {
    const value = e.detail.value
    console.log('切换生物识别登录:', value)
    
    if (value) {
      // 检查设备是否支持生物识别
      wx.checkIsSupportSoterAuthentication({
        success: (res) => {
          if (res.supportMode.includes('fingerPrint') || res.supportMode.includes('facial')) {
            this.setData({
              'privacySettings.biometric': true
            })
            app.showToast('生物识别登录已开启', 'success')
          } else {
            app.showToast('设备不支持生物识别', 'error')
            this.setData({
              'privacySettings.biometric': false
            })
          }
        },
        fail: () => {
          app.showToast('设备不支持生物识别', 'error')
          this.setData({
            'privacySettings.biometric': false
          })
        }
      })
    } else {
      this.setData({
        'privacySettings.biometric': false
      })
    }
  },

  // 切换自动锁定
  toggleAutoLock(e) {
    const value = e.detail.value
    console.log('切换自动锁定:', value)
    
    this.setData({
      'privacySettings.autoLock': value
    })
  },

  // 切换护理提醒
  toggleCareReminders(e) {
    const value = e.detail.value
    console.log('切换护理提醒:', value)
    
    this.setData({
      'privacySettings.careReminders': value
    })
  },

  // 切换健康报告
  toggleHealthReports(e) {
    const value = e.detail.value
    console.log('切换健康报告:', value)
    
    this.setData({
      'privacySettings.healthReports': value
    })
  },

  // 切换学习提醒
  toggleLearningReminders(e) {
    const value = e.detail.value
    console.log('切换学习提醒:', value)
    
    this.setData({
      'privacySettings.learningReminders': value
    })
  },

  // 修改密码
  changePassword() {
    console.log('修改密码')
    wx.showModal({
      title: '修改密码',
      content: '密码修改功能需要联系客服进行身份验证，是否现在联系客服？',
      success: (res) => {
        if (res.confirm) {
          this.contactSupport()
        }
      }
    })
  },

  // 导出数据
  exportData() {
    console.log('导出数据')
    wx.showLoading({
      title: '正在导出数据...'
    })
    
    // 模拟导出过程
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '导出成功',
        content: '您的健康数据已导出，文件已保存到手机。如需其他格式，请联系客服。',
        showCancel: false,
        confirmText: '确定'
      })
    }, 2000)
  },

  // 删除数据
  deleteData() {
    console.log('删除数据')
    wx.showModal({
      title: '确认删除',
      content: '删除数据后将无法恢复，包括所有健康记录、学习进度等。确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '二次确认',
            content: '此操作不可逆，请再次确认是否删除所有数据？',
            success: (res2) => {
              if (res2.confirm) {
                this.performDataDeletion()
              }
            }
          })
        }
      }
    })
  },

  // 执行数据删除
  performDataDeletion() {
    wx.showLoading({
      title: '正在删除数据...'
    })
    
    setTimeout(() => {
      try {
        // 清除所有本地数据
        wx.clearStorageSync()
        
        wx.hideLoading()
        app.showToast('数据已删除', 'success')
        
        // 返回登录页面
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
      } catch (e) {
        console.error('删除数据失败:', e)
        wx.hideLoading()
        app.showToast('删除失败，请重试', 'error')
      }
    }, 2000)
  },

  // 查看隐私政策
  viewPrivacyPolicy() {
    console.log('查看隐私政策')
    wx.showModal({
      title: '隐私政策',
      content: '我们承诺保护您的隐私：\n\n1. 所有健康数据均加密存储\n2. 不会向第三方分享您的个人信息\n3. 您可以随时删除或导出数据\n4. 我们定期更新隐私保护措施\n\n详细政策请访问官网或联系客服。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 联系隐私问题
  contactPrivacy() {
    console.log('联系隐私问题')
    wx.showModal({
      title: '隐私问题反馈',
      content: '如有隐私问题，请联系我们：\n\n邮箱：privacy@stoma-care.com\n电话：400-123-4567\n工作时间：8:00-20:00',
      success: (res) => {
        if (res.confirm) {
          this.contactSupport()
        }
      }
    })
  },

  // 联系客服
  contactSupport() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n客服时间：8:00-20:00',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 保存设置
  saveSettings() {
    console.log('保存隐私设置')
    
    try {
      // 保存到本地存储
      wx.setStorageSync('privacySettings', this.data.privacySettings)
      
      app.showToast('设置已保存', 'success')
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } catch (e) {
      console.error('保存设置失败:', e)
      app.showToast('保存失败，请重试', 'error')
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '隐私设置 - 造口护理患者端',
      path: '/pages/privacy/privacy'
    }
  }
}) 