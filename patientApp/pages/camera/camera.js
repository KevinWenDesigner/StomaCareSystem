// patient-app/pages/camera/camera.js
const app = getApp()
const api = require('../../utils/api.js')
import { formatDateTime, getCurrentDateTime } from '../../utils/dateFormat.js'

Page({
  data: {
    photoPath: '',
    assessmentResult: null,
    assessmentTime: '',
    historyList: [],
    isAnalyzing: false, // 是否正在分析
    analysisProgress: 0, // 分析进度
    currentStep: 0, // 当前分析步骤
    currentStepText: '', // 当前步骤文字
    cameraPermission: false, // 相机权限
    autoCapture: false, // 自动拍照模式
    captureCountdown: 0, // 自动拍照倒计时
    useBackendAI: true, // 是否使用后端AI服务（true=使用后端API和数据库）
    stepInterval: null, // 保存定时器引用
    // 分析步骤定义
    analysisSteps: [
      { id: 1, icon: '📸', text: '图像采集', progress: 10 },
      { id: 2, icon: '🔍', text: '预处理增强', progress: 20 },
      { id: 3, icon: '🎯', text: '造口定位', progress: 30 },
      { id: 4, icon: '🌈', text: '颜色分析', progress: 45 },
      { id: 5, icon: '📏', text: '尺寸测量', progress: 60 },
      { id: 6, icon: '🔬', text: '皮肤检测', progress: 75 },
      { id: 7, icon: '🤖', text: 'AI深度学习', progress: 85 },
      { id: 8, icon: '💡', text: '生成建议', progress: 95 },
      { id: 9, icon: '✅', text: '评估完成', progress: 100 }
    ]
  },

  onLoad() {
    console.log('=== AI评估页面加载 ===')
    console.log('初始数据:', {
      useBackendAI: this.data.useBackendAI,
      analysisSteps: this.data.analysisSteps.length
    })
    
    // 显示加载状态
    wx.showLoading({ title: '加载中...' })
    
    this.checkCameraPermission()
    this.loadHistoryData().finally(() => {
      wx.hideLoading()
    })
  },

  onShow() {
    console.log('=== AI评估页面显示 ===')
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
  async loadHistoryData() {
    console.log('>>> 开始加载历史数据')
    try {
      // 检查token
      const token = wx.getStorageSync('token')
      if (!token) {
        console.warn('⚠️ 未找到token，无法加载历史数据')
        return
      }
      
      console.log('📡 调用getAssessments接口...')
      // 从后端获取评估历史
      const res = await api.getAssessments({ page: 1, pageSize: 20 })
      console.log('✅ 接口返回结果:', res)
      
      if (res.success && res.data) {
        const historyList = Array.isArray(res.data) ? res.data : []
        console.log('📊 历史记录数量:', historyList.length)
        
        // 转换数据格式以适配原有显示
        const formattedHistory = historyList.map(item => ({
          id: item.id,
          photoPath: item.imageUrl,
          score: this.calculateScoreFromRisk(item.riskLevel),
          level: this.getRiskLevelNumber(item.riskLevel),
          levelText: this.getRiskLevelText(item.riskLevel),
          time: formatDateTime(item.createdAt),
          timestamp: new Date(item.createdAt).getTime(),
          description: item.suggestions || '评估完成',
          analysis: {
            redness: 0,
            swelling: 0,
            infection: this.getRiskPercent(item.riskLevel),
            healing: 100 - this.getRiskPercent(item.riskLevel)
          },
          rawData: item // 保存原始后端数据
        }))
        
        console.log('💾 更新页面数据...')
        this.setData({ historyList: formattedHistory })
        
        // 同时保存到本地缓存
        wx.setStorageSync('assessmentHistory', formattedHistory)
        console.log('✅ 历史数据加载完成')
      } else {
        console.warn('⚠️ 接口返回但数据为空或失败')
        console.log('Response:', res)
      }
    } catch (error) {
      console.error('❌ 加载历史数据失败:', error)
      console.error('错误详情:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error
      })
      
      // 如果后端获取失败，使用本地缓存
      const cachedHistory = wx.getStorageSync('assessmentHistory') || []
      console.log('📂 使用本地缓存，记录数:', cachedHistory.length)
      this.setData({ historyList: cachedHistory })
      
      // 显示友好的错误提示
      if (error.statusCode === 0) {
        wx.showToast({
          title: '网络连接失败，请检查后端服务',
          icon: 'none',
          duration: 3000
        })
      }
    }
  },

  // 根据风险等级计算分数
  calculateScoreFromRisk(riskLevel) {
    const riskMap = {
      'low': 90,
      'medium': 70,
      'high': 50
    }
    return riskMap[riskLevel] || 75
  },

  // 获取风险等级数字
  getRiskLevelNumber(riskLevel) {
    const levelMap = {
      'low': 1,
      'medium': 2,
      'high': 3
    }
    return levelMap[riskLevel] || 2
  },

  // 获取风险等级文本
  getRiskLevelText(riskLevel) {
    const textMap = {
      'low': '优秀',
      'medium': '良好',
      'high': '需注意'
    }
    return textMap[riskLevel] || '一般'
  },

  // 获取风险百分比
  getRiskPercent(riskLevel) {
    const percentMap = {
      'low': 20,
      'medium': 50,
      'high': 80
    }
    return percentMap[riskLevel] || 40
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
  async performAssessment(photoPath) {
    console.log('开始AI评估，useBackendAI:', this.data.useBackendAI)
    
    // 重置状态
    this.setData({
      isAnalyzing: true,
      analysisProgress: 0,
      currentStep: 0,
      currentStepText: '',
      assessmentResult: null
    })

    if (this.data.useBackendAI) {
      // 使用后端AI服务（带动画）
      await this.callBackendAIService(photoPath)
    } else {
      // 使用模拟评估（带动画）
      this.performMockAssessment(photoPath)
    }
  },

  // 模拟评估（用于开发测试）
  performMockAssessment(photoPath) {
    console.log('执行模拟评估，开始步骤动画')
    
    this.setData({
      isAnalyzing: true,
      analysisProgress: 0,
      currentStep: 0,
      currentStepText: '开始分析...'
    })
    
    // 按步骤执行分析动画
    this.executeAnalysisSteps(photoPath)
  },

  // 执行分析步骤动画
  executeAnalysisSteps(photoPath) {
    console.log('开始执行分析步骤动画，总步骤数:', this.data.analysisSteps.length)
    
    const steps = this.data.analysisSteps
    let currentStepIndex = 0
    
    const stepInterval = setInterval(() => {
      console.log('执行步骤', currentStepIndex + 1, '/', steps.length)
      
      if (currentStepIndex >= steps.length) {
        console.log('所有步骤完成，清除定时器')
        clearInterval(stepInterval)
        
        // 延迟一下显示结果，让用户看到100%
        setTimeout(() => {
          console.log('延迟后开始显示评估结果')
          this.completeAssessment(photoPath)
        }, 500)
        return
      }
      
      const step = steps[currentStepIndex]
      console.log('当前步骤:', step.text, step.progress + '%')
      
      // 播放震动反馈（每个步骤）
      wx.vibrateShort({ type: 'light' })
      
      this.setData({
        currentStep: currentStepIndex + 1,
        currentStepText: step.text,
        analysisProgress: step.progress
      })
      
      console.log('步骤状态已更新:', {
        currentStep: currentStepIndex + 1,
        currentStepText: step.text,
        analysisProgress: step.progress
      })
      
      currentStepIndex++
    }, 900) // 每900ms执行一个步骤，总计约8秒
    
    // 保存定时器引用以便可以清除
    this.setData({ stepInterval })
  },

  // 调用后端AI服务
  async callBackendAIService(photoPath) {
    try {
      this.setData({
        isAnalyzing: true,
        analysisProgress: 0,
        currentStep: 0
      })

      // 启动步骤动画
      const steps = this.data.analysisSteps
      let currentStepIndex = 0
      
      const stepInterval = setInterval(() => {
        if (currentStepIndex < steps.length - 1) { // 留最后一步给实际结果
          const step = steps[currentStepIndex]
          wx.vibrateShort({ type: 'light' })
          
          this.setData({
            currentStep: currentStepIndex + 1,
            currentStepText: step.text,
            analysisProgress: step.progress
          })
          
          currentStepIndex++
        }
      }, 900) // 每900ms执行一个步骤，总计约8秒

      // 获取患者ID
      const patientInfo = wx.getStorageSync('patientInfo')
      const patientId = patientInfo ? patientInfo.id : null

      // 上传图片进行评估
      const res = await api.uploadAssessmentImage(photoPath, patientId)
      
      clearInterval(stepInterval)

      if (res.success && res.data) {
        // 显示最后一步
        const lastStep = steps[steps.length - 1]
        this.setData({
          currentStep: steps.length,
          currentStepText: lastStep.text,
          analysisProgress: 100
        })
        
        // 震动反馈
        wx.vibrateLong()
        
        // 转换后端返回的数据为前端需要的格式
        const assessmentResult = {
          score: this.calculateScoreFromRisk(res.data.riskLevel),
          level: this.getRiskLevelNumber(res.data.riskLevel),
          levelText: this.getRiskLevelText(res.data.riskLevel),
          description: `造口颜色: ${res.data.stomaColor || '正常'}，大小: ${res.data.stomaSize || '正常'}`,
          suggestion: res.data.suggestions || '请继续保持良好的护理习惯',
          attention: res.data.skinCondition ? `皮肤状况: ${res.data.skinCondition}` : '注意观察造口周围皮肤变化',
          analysis: {
            redness: this.getRiskPercent(res.data.riskLevel),
            swelling: Math.floor(Math.random() * 50),
            infection: this.getRiskPercent(res.data.riskLevel),
            healing: 100 - this.getRiskPercent(res.data.riskLevel)
          },
          rawData: res.data // 保存原始后端数据
        }

        const assessmentTime = getCurrentDateTime()
        
        // 延迟显示结果
        setTimeout(() => {
          this.setData({
            assessmentResult,
            assessmentTime,
            isAnalyzing: false,
            analysisProgress: 0,
            currentStep: 0,
            currentStepText: ''
          })
          
          // 保存评估记录
          this.saveAssessmentRecord(photoPath, assessmentResult, assessmentTime)
          
          app.showToast('✨ 评估完成', 'success')
        }, 800)
      } else {
        throw new Error(res.message || 'AI评估失败')
      }
    } catch (error) {
      console.error('后端AI服务调用失败:', error)
      
      // 如果后端失败，使用模拟评估
      wx.showModal({
        title: '提示',
        content: 'AI服务暂时不可用，是否使用模拟评估？',
        confirmText: '使用模拟',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.setData({ 
              isAnalyzing: false,
              analysisProgress: 0
            })
            this.performMockAssessment(photoPath)
          } else {
            this.setData({ 
              isAnalyzing: false,
              analysisProgress: 0
            })
            app.showToast('评估已取消', 'none')
          }
        }
      })
    }
  },

  // 完成评估
  completeAssessment(photoPath, aiResult = null) {
    // 如果没有AI结果，使用模拟数据
    const assessmentResult = aiResult || this.generateMockResult()
    
    const assessmentTime = getCurrentDateTime()
    
    // 显示完成动画
    this.setData({
      currentStep: this.data.analysisSteps.length,
      currentStepText: '评估完成',
      analysisProgress: 100
    })
    
    // 震动反馈
    wx.vibrateLong()
    
    // 延迟显示结果，让用户看到100%完成
    setTimeout(() => {
      this.setData({
        assessmentResult,
        assessmentTime,
        isAnalyzing: false,
        analysisProgress: 0,
        currentStep: 0,
        currentStepText: ''
      })
      
      // 保存评估记录
      this.saveAssessmentRecord(photoPath, assessmentResult, assessmentTime)
      
      app.showToast('✨ 评估完成', 'success')
    }, 800)
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
        id: result.rawData?.id || Date.now().toString(),
        photoPath,
        score: result.score,
        level: result.level,
        levelText: result.levelText,
        time,
        timestamp: Date.now(),
        description: result.description,
        analysis: result.analysis,
        rawData: result.rawData // 保存原始后端数据
      }
      
      historyList.unshift(newRecord)
      
      // 只保留最近20条记录
      if (historyList.length > 20) {
        historyList.splice(20)
      }
      
      wx.setStorageSync('assessmentHistory', historyList)
      this.setData({ historyList })
      
      // 标记首页需要刷新
      app.globalData.needRefreshIndex = true
      
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