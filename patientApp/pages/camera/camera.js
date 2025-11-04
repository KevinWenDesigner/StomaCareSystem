// patient-app/pages/camera/camera.js
const app = getApp()
import { formatDateTime, getCurrentDateTime } from '../../utils/dateFormat.js'

Page({
  data: {
    photoPath: '',
    assessmentResult: null,
    assessmentTime: '',
    historyList: [],
    isAnalyzing: false, // 是否正在分析
    analysisProgress: 0, // 分析进度
    cameraPermission: false, // 相机权限
    autoCapture: false, // 自动拍照模式
    captureCountdown: 0 // 自动拍照倒计时
  },

  onLoad() {
    console.log('AI评估页面加载')
    this.checkCameraPermission()
    this.loadHistoryData()
  },

  onShow() {
    console.log('AI评估页面显示')
    this.loadHistoryData()
  },

  // 检查相机权限
  checkCameraPermission() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera']) {
          this.setData({ cameraPermission: true })
        } else {
          this.requestCameraPermission()
        }
      }
    })
  },

  // 请求相机权限
  requestCameraPermission() {
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        this.setData({ cameraPermission: true })
        app.showToast('相机权限已获取', 'success')
      },
      fail: () => {
        app.showToast('需要相机权限才能使用拍照功能', 'error')
      }
    })
  },

  // 加载历史数据
  loadHistoryData() {
    try {
      const historyList = wx.getStorageSync('assessmentHistory') || []
      this.setData({ historyList })
    } catch (e) {
      console.error('加载历史数据失败:', e)
    }
  },

  // 自动拍照模式
  toggleAutoCapture() {
    const autoCapture = !this.data.autoCapture
    this.setData({ autoCapture })
    
    if (autoCapture) {
      this.startAutoCapture()
    } else {
      this.stopAutoCapture()
    }
  },

  // 开始自动拍照
  startAutoCapture() {
    console.log('开始自动拍照倒计时')
    this.setData({ captureCountdown: 3 })
    
    // 播放开始音效
    this.playCountdownSound()
    
    const countdownInterval = setInterval(() => {
      const currentCountdown = this.data.captureCountdown - 1
      console.log('倒计时:', currentCountdown)
      
      this.setData({ captureCountdown: currentCountdown })
      
      // 播放倒计时音效
      if (currentCountdown > 0) {
        this.playCountdownSound()
      }
      
      if (currentCountdown <= 0) {
        clearInterval(countdownInterval)
        console.log('倒计时结束，开始拍照')
        this.takePhoto()
        this.setData({ 
          autoCapture: false,
          captureCountdown: 0
        })
      }
    }, 1000)
  },

  // 播放倒计时音效
  playCountdownSound() {
    // 使用微信小程序的震动反馈
    wx.vibrateShort({
      type: 'light'
    })
  },

  // 停止自动拍照
  stopAutoCapture() {
    console.log('停止自动拍照')
    this.setData({ 
      autoCapture: false,
      captureCountdown: 0
    })
    
    // 显示取消提示
    app.showToast('已取消自动拍照', 'none')
  },

  // 拍照
  takePhoto() {
    console.log('开始拍照')
    
    if (!this.data.cameraPermission) {
      this.requestCameraPermission()
      return
    }
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'back',
      success: (res) => {
        console.log('拍照成功:', res)
        const tempFilePath = res.tempFiles[0].tempFilePath
        
        this.setData({
          photoPath: tempFilePath
        })
        
        // 开始AI评估
        this.performAssessment(tempFilePath)
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        app.showToast('拍照失败，请重试', 'error')
      }
    })
  },

  // 选择照片
  chooseImage() {
    console.log('选择照片')
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        console.log('选择照片成功:', res)
        const tempFilePath = res.tempFiles[0].tempFilePath
        
        this.setData({
          photoPath: tempFilePath
        })
        
        // 开始AI评估
        this.performAssessment(tempFilePath)
      },
      fail: (err) => {
        console.error('选择照片失败:', err)
        app.showToast('选择照片失败，请重试', 'error')
      }
    })
  },

  // 执行AI评估
  performAssessment(photoPath) {
    console.log('开始AI评估')
    
    this.setData({
      isAnalyzing: true,
      analysisProgress: 0
    })
    
    // 模拟分析进度
    const progressInterval = setInterval(() => {
      const progress = this.data.analysisProgress + 10
      this.setData({ analysisProgress: progress })
      
      if (progress >= 100) {
        clearInterval(progressInterval)
        this.completeAssessment(photoPath)
      }
    }, 200)
    
    // 实际项目中，这里应该调用AI服务
    // this.callAIService(photoPath)
  },

  // 调用AI服务（实际实现）
  callAIService(photoPath) {
    // 上传图片到服务器
    wx.uploadFile({
      url: 'https://your-ai-service.com/analyze',
      filePath: photoPath,
      name: 'image',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: (res) => {
        const result = JSON.parse(res.data)
        this.completeAssessment(photoPath, result)
      },
      fail: (err) => {
        console.error('AI服务调用失败:', err)
        app.showToast('AI分析失败，请重试', 'error')
        this.setData({ isAnalyzing: false })
      }
    })
  },

  // 完成评估
  completeAssessment(photoPath, aiResult = null) {
    // 如果没有AI结果，使用模拟数据
    const assessmentResult = aiResult || this.generateMockResult()
    
    const assessmentTime = getCurrentDateTime()
    
    this.setData({
      assessmentResult,
      assessmentTime,
      isAnalyzing: false,
      analysisProgress: 0
    })
    
    // 保存评估记录
    this.saveAssessmentRecord(photoPath, assessmentResult, assessmentTime)
    
    app.showToast('评估完成', 'success')
  },

  // 生成模拟AI结果
  generateMockResult() {
    const skinConditions = [
      '造口周围皮肤状态良好，无明显异常',
      '造口周围皮肤轻微发红，建议加强护理',
      '造口周围皮肤有轻微炎症，需要及时处理',
      '造口周围皮肤状态优秀，继续保持'
    ]
    
    const suggestions = [
      '继续使用当前护理产品，保持清洁干燥',
      '建议更换护理产品，使用更温和的清洁剂',
      '增加护理频率，注意观察变化',
      '继续保持良好的护理习惯'
    ]
    
    const attentions = [
      '注意观察造口周围皮肤变化，如有异常及时就医',
      '避免使用刺激性产品，保持皮肤清洁',
      '定期更换造口袋，防止感染',
      '保持良好的个人卫生习惯'
    ]
    
    const score = Math.floor(Math.random() * 40) + 60 // 60-100分
    const level = score >= 90 ? 1 : score >= 75 ? 2 : 3
    
    return {
      score,
      level,
      description: skinConditions[Math.floor(Math.random() * skinConditions.length)],
      levelText: this.getLevelText(level),
      suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
      attention: attentions[Math.floor(Math.random() * attentions.length)],
      // AI分析的具体指标
      analysis: {
        redness: Math.floor(Math.random() * 100), // 发红程度
        swelling: Math.floor(Math.random() * 100), // 肿胀程度
        infection: Math.floor(Math.random() * 100), // 感染风险
        healing: Math.floor(Math.random() * 100) // 愈合程度
      }
    }
  },

  // 获取等级文本
  getLevelText(level) {
    const levelMap = {
      1: '优秀',
      2: '良好', 
      3: '一般'
    }
    return levelMap[level] || '未知'
  },

  // 保存评估记录
  saveAssessmentRecord(photoPath, result, time) {
    try {
      const historyList = wx.getStorageSync('assessmentHistory') || []
      const newRecord = {
        id: Date.now().toString(),
        photoPath,
        score: result.score,
        level: result.level,
        levelText: result.levelText,
        time,
        description: result.description,
        analysis: result.analysis
      }
      
      historyList.unshift(newRecord)
      
      // 只保留最近20条记录
      if (historyList.length > 20) {
        historyList.splice(20)
      }
      
      wx.setStorageSync('assessmentHistory', historyList)
      this.setData({ historyList })
      
      console.log('评估记录已保存')
    } catch (e) {
      console.error('保存评估记录失败:', e)
    }
  },

  // 查看历史
  viewHistory() {
    console.log('查看历史记录')
    wx.navigateTo({
      url: '/pages/camera/history/history'
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: 'AI智能评估 - 造口护理患者端',
      path: '/pages/camera/camera'
    }
  }
}) 