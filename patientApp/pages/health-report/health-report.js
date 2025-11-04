// patient-app/pages/health-report/health-report.js
const app = getApp()

Page({
  data: {
    loading: true,
    currentTab: 'overview',
    healthData: {
      basicInfo: {
        name: '张患者',
        age: 65,
        gender: '女',
        stomaType: '回肠造口',
        stomaDate: '2024-01-15',
        daysSince: 15
      },
      vitalSigns: {
        temperature: 36.8,
        bloodPressure: '120/80',
        heartRate: 72,
        weight: 65.5,
        bmi: 22.1
      },
      stomaStatus: {
        color: '正常',
        size: '2.5cm',
        height: '正常',
        skinCondition: '良好',
        lastChange: '2024-01-20'
      },
      symptoms: {
        pain: 2,
        bleeding: '无',
        infection: '无',
        obstruction: '无',
        prolapse: '无'
      }
    },
    weeklyStats: {
      painLevel: [2, 1, 3, 2, 1, 2, 1],
      bowelMovements: [3, 2, 4, 3, 2, 3, 2],
      skinIssues: [0, 0, 1, 0, 0, 0, 0],
      moodScore: [8, 7, 6, 8, 9, 8, 9]
    },
    monthlyTrends: {
      painTrend: [2.1, 2.3, 1.8, 2.0, 1.9, 2.2, 1.7, 2.1],
      weightTrend: [66.2, 65.8, 65.5, 65.3, 65.1, 65.0, 64.8, 65.5],
      bmiTrend: [22.5, 22.3, 22.1, 22.0, 21.9, 21.8, 21.7, 22.1]
    },
    healthScore: 85,
    recommendations: [],
    riskFactors: [],
    improvementAreas: []
  },

  onLoad() {
    console.log('健康报告页面加载')
    this.loadHealthData()
  },

  onShow() {
    console.log('健康报告页面显示')
  },

  // 加载健康数据
  loadHealthData() {
    try {
      // 从本地存储加载数据
      const symptomRecords = wx.getStorageSync('symptomRecords') || []
      const learningData = wx.getStorageSync('learningData') || { courses: [] }
      const userInfo = wx.getStorageSync('userInfo') || this.data.healthData.basicInfo
      
      // 更新基本信息
      this.setData({
        'healthData.basicInfo': {
          ...this.data.healthData.basicInfo,
          ...userInfo
        }
      })
      
      // 计算健康评分
      this.calculateHealthScore()
      
      // 生成健康建议
      this.generateRecommendations()
      
      // 分析风险因素
      this.analyzeRiskFactors()
      
      // 识别改进领域
      this.identifyImprovementAreas()
      
      this.setData({
        loading: false
      })
      
      console.log('健康数据加载完成')
    } catch (e) {
      console.error('加载健康数据失败:', e)
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

  // 计算健康评分
  calculateHealthScore() {
    const { symptoms, vitalSigns, stomaStatus } = this.data.healthData
    
    let score = 100
    
    // 根据症状扣分
    if (symptoms.pain > 3) score -= 10
    if (symptoms.bleeding !== '无') score -= 15
    if (symptoms.infection !== '无') score -= 20
    if (symptoms.obstruction !== '无') score -= 15
    if (symptoms.prolapse !== '无') score -= 15
    
    // 根据生命体征扣分
    if (vitalSigns.temperature > 37.5 || vitalSigns.temperature < 36.0) score -= 5
    if (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60) score -= 5
    
    // 根据造口状态扣分
    if (stomaStatus.color !== '正常') score -= 10
    if (stomaStatus.skinCondition !== '良好') score -= 10
    
    this.setData({
      'healthData.healthScore': Math.max(0, score)
    })
  },

  // 生成健康建议
  generateRecommendations() {
    const { symptoms, vitalSigns, stomaStatus } = this.data.healthData
    const recommendations = []
    
    // 根据症状生成建议
    if (symptoms.pain > 3) {
      recommendations.push({
        type: 'warning',
        title: '疼痛管理',
        content: '建议咨询医生调整止痛方案，注意休息和放松',
        priority: 'high'
      })
    }
    
    if (symptoms.bleeding !== '无') {
      recommendations.push({
        type: 'urgent',
        title: '出血处理',
        content: '发现出血应立即就医，避免剧烈运动',
        priority: 'critical'
      })
    }
    
    if (vitalSigns.temperature > 37.5) {
      recommendations.push({
        type: 'warning',
        title: '体温异常',
        content: '体温偏高，建议多休息，必要时就医',
        priority: 'medium'
      })
    }
    
    if (stomaStatus.skinCondition !== '良好') {
      recommendations.push({
        type: 'info',
        title: '皮肤护理',
        content: '加强造口周围皮肤护理，使用专业护理产品',
        priority: 'medium'
      })
    }
    
    // 添加常规建议
    recommendations.push({
      type: 'info',
      title: '定期复查',
      content: '建议每月进行一次造口专科复查',
      priority: 'low'
    })
    
    this.setData({
      recommendations: recommendations
    })
  },

  // 分析风险因素
  analyzeRiskFactors() {
    const { symptoms, vitalSigns, stomaStatus } = this.data.healthData
    const riskFactors = []
    
    if (symptoms.pain > 4) {
      riskFactors.push({
        factor: '持续疼痛',
        level: 'high',
        description: '可能影响生活质量，需要及时处理'
      })
    }
    
    if (symptoms.bleeding !== '无') {
      riskFactors.push({
        factor: '造口出血',
        level: 'critical',
        description: '可能影响造口功能，需要立即就医'
      })
    }
    
    if (vitalSigns.temperature > 38.0) {
      riskFactors.push({
        factor: '发热',
        level: 'high',
        description: '可能提示感染，需要及时就医'
      })
    }
    
    if (stomaStatus.color !== '正常') {
      riskFactors.push({
        factor: '造口颜色异常',
        level: 'medium',
        description: '可能提示血液循环问题'
      })
    }
    
    this.setData({
      riskFactors: riskFactors
    })
  },

  // 识别改进领域
  identifyImprovementAreas() {
    const { symptoms, vitalSigns, stomaStatus } = this.data.healthData
    const improvementAreas = []
    
    if (symptoms.pain > 2) {
      improvementAreas.push({
        area: '疼痛管理',
        current: `${symptoms.pain}/5`,
        target: '≤2/5',
        progress: Math.max(0, (5 - symptoms.pain) / 3 * 100)
      })
    }
    
    if (vitalSigns.weight < 60) {
      improvementAreas.push({
        area: '体重管理',
        current: `${vitalSigns.weight}kg`,
        target: '≥60kg',
        progress: Math.min(100, (vitalSigns.weight / 60) * 100)
      })
    }
    
    if (stomaStatus.skinCondition !== '良好') {
      improvementAreas.push({
        area: '皮肤护理',
        current: stomaStatus.skinCondition,
        target: '良好',
        progress: 60
      })
    }
    
    this.setData({
      improvementAreas: improvementAreas
    })
  },

  // 导出健康报告
  exportReport() {
    app.showToast('报告导出功能开发中', 'none')
  },

  // 分享健康报告
  shareReport() {
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
      title: '我的健康报告 - 造口护理患者端',
      path: '/pages/health-report/health-report'
    }
  }
}) 