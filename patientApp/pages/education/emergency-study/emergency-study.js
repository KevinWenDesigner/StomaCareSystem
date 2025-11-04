// patient-app/pages/education/emergency-study/emergency-study.js
const app = getApp()
import { getCurrentDateTime } from '../../../utils/dateFormat.js'

Page({
  data: {
    course: null,
    currentChapter: 0,
    loading: true,
    studyProgress: 0,
    isCompleted: false,
    showEmergencySimulation: false,
    showEmergencyDrill: false,
    emergencyScenario: null,
    drillStep: 0,
    drillScore: 0,
    emergencyLevel: 'low'
  },

  onLoad() {
    console.log('应急处理学习页面加载')
    this.loadCourseData()
  },

  onShow() {
    console.log('应急处理学习页面显示')
  },

  // 加载课程数据
  loadCourseData() {
    try {
      const globalData = getApp().globalData
      if (globalData && globalData.currentCourse) {
        const course = globalData.currentCourse
        
        this.setData({
          course: course,
          loading: false
        })
        
        // 加载学习进度
        this.loadStudyProgress(course.id)
        
        console.log('加载应急处理课程数据:', course.title)
      } else {
        app.showToast('课程数据不存在', 'error')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (e) {
      console.error('加载课程数据失败:', e)
      app.showToast('数据加载失败', 'error')
    }
  },

  // 加载学习进度
  loadStudyProgress(courseId) {
    try {
      const learningData = wx.getStorageSync('learningData') || { courses: [] }
      const userCourse = learningData.courses.find(c => c.id === courseId)
      
      if (userCourse) {
        this.setData({
          studyProgress: userCourse.progress || 0,
          isCompleted: (userCourse.progress || 0) >= 100
        })
      }
    } catch (e) {
      console.error('加载学习进度失败:', e)
    }
  },

  // 开始学习章节
  startChapter(e) {
    const chapterIndex = e.currentTarget.dataset.index
    console.log('开始学习章节:', chapterIndex)
    
    this.setData({
      currentChapter: chapterIndex
    })
    
    app.showToast(`开始学习第${chapterIndex + 1}章`, 'none')
  },

  // 完成章节
  completeChapter() {
    const { course, currentChapter, studyProgress } = this.data
    
    if (!course || !course.chapters) {
      app.showToast('课程数据错误', 'error')
      return
    }
    
    const totalChapters = course.chapters.length
    const newProgress = Math.round(((currentChapter + 1) / totalChapters) * 100)
    
    // 更新学习进度
    this.updateStudyProgress(newProgress)
    
    // 标记章节为已完成
    const updatedCourse = { ...course }
    if (updatedCourse.chapters && updatedCourse.chapters[currentChapter]) {
      updatedCourse.chapters[currentChapter].completed = true
    }
    
    this.setData({
      course: updatedCourse,
      studyProgress: newProgress,
      isCompleted: newProgress >= 100
    })
    
    // 更新全局数据
    getApp().globalData.currentCourse = updatedCourse
    
    app.showToast('章节学习完成', 'success')
    
    // 如果是应急处理课程，显示紧急情况模拟
    if (newProgress >= 100) {
      this.showEmergencySimulation()
    } else {
      // 如果还有下一章，自动进入下一章
      if (currentChapter + 1 < totalChapters) {
        setTimeout(() => {
          this.setData({
            currentChapter: currentChapter + 1
          })
          app.showToast(`进入第${currentChapter + 2}章`, 'none')
        }, 1000)
      }
    }
  },

  // 显示紧急情况模拟
  showEmergencySimulation() {
    this.setData({
      showEmergencySimulation: true
    })
  },

  // 关闭紧急情况模拟
  closeEmergencySimulation() {
    this.setData({
      showEmergencySimulation: false
    })
  },

  // 开始应急演练
  startEmergencyDrill() {
    const scenario = this.generateEmergencyScenario()
    
    this.setData({
      showEmergencyDrill: true,
      emergencyScenario: scenario,
      drillStep: 0,
      drillScore: 0
    })
    
    app.showToast('开始应急演练', 'none')
  },

  // 关闭应急演练
  closeEmergencyDrill() {
    this.setData({
      showEmergencyDrill: false,
      emergencyScenario: null,
      drillStep: 0,
      drillScore: 0
    })
  },

  // 生成紧急情况场景
  generateEmergencyScenario() {
    const scenarios = [
      {
        title: '造口出血紧急情况',
        description: '患者发现造口周围有少量出血，伴有轻微疼痛',
        level: 'medium',
        symptoms: ['造口周围出血', '轻微疼痛', '局部红肿'],
        steps: [
          {
            step: 1,
            title: '评估出血情况',
            description: '观察出血量、颜色和持续时间',
            options: [
              { text: '立即就医', correct: false, reason: '应先评估出血情况' },
              { text: '观察出血量', correct: true, reason: '正确，应先评估出血情况' },
              { text: '忽略不管', correct: false, reason: '出血需要及时处理' }
            ]
          },
          {
            step: 2,
            title: '局部处理',
            description: '清洁造口周围，使用止血材料',
            options: [
              { text: '用清水冲洗', correct: false, reason: '应使用生理盐水' },
              { text: '用生理盐水清洁', correct: true, reason: '正确，生理盐水更安全' },
              { text: '用酒精消毒', correct: false, reason: '酒精会刺激伤口' }
            ]
          },
          {
            step: 3,
            title: '就医指征',
            description: '判断是否需要立即就医',
            options: [
              { text: '出血量大时就医', correct: true, reason: '正确，大量出血需要就医' },
              { text: '继续观察', correct: false, reason: '持续出血需要就医' },
              { text: '自行处理', correct: false, reason: '出血需要专业处理' }
            ]
          }
        ]
      },
      {
        title: '造口脱垂紧急情况',
        description: '患者发现造口突出，伴有不适感',
        level: 'high',
        symptoms: ['造口突出', '不适感', '局部疼痛'],
        steps: [
          {
            step: 1,
            title: '评估脱垂程度',
            description: '观察脱垂的严重程度和症状',
            options: [
              { text: '立即复位', correct: false, reason: '应先评估脱垂程度' },
              { text: '评估脱垂程度', correct: true, reason: '正确，应先评估情况' },
              { text: '等待自愈', correct: false, reason: '脱垂需要及时处理' }
            ]
          },
          {
            step: 2,
            title: '紧急复位',
            description: '在医生指导下进行复位操作',
            options: [
              { text: '自行复位', correct: false, reason: '应在医生指导下进行' },
              { text: '就医处理', correct: true, reason: '正确，脱垂需要专业处理' },
              { text: '继续观察', correct: false, reason: '脱垂需要及时处理' }
            ]
          },
          {
            step: 3,
            title: '预防措施',
            description: '了解脱垂的预防方法',
            options: [
              { text: '避免剧烈运动', correct: true, reason: '正确，剧烈运动可能加重脱垂' },
              { text: '增加运动量', correct: false, reason: '剧烈运动可能加重脱垂' },
              { text: '忽略预防', correct: false, reason: '预防很重要' }
            ]
          }
        ]
      }
    ]
    
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  },

  // 选择演练选项
  selectDrillOption(e) {
    const { optionIndex } = e.currentTarget.dataset
    const { emergencyScenario, drillStep, drillScore } = this.data
    
    if (!emergencyScenario || !emergencyScenario.steps[drillStep]) {
      return
    }
    
    const currentStep = emergencyScenario.steps[drillStep]
    const selectedOption = currentStep.options[optionIndex]
    
    // 计算得分
    let newScore = drillScore
    if (selectedOption.correct) {
      newScore += 10
    }
    
    // 显示结果
    app.showToast(selectedOption.correct ? '回答正确' : '回答错误', selectedOption.correct ? 'success' : 'error')
    
    // 进入下一步
    if (drillStep + 1 < emergencyScenario.steps.length) {
      setTimeout(() => {
        this.setData({
          drillStep: drillStep + 1,
          drillScore: newScore
        })
      }, 1000)
    } else {
      // 演练完成
      setTimeout(() => {
        this.setData({
          drillStep: drillStep + 1,
          drillScore: newScore
        })
        app.showToast(`演练完成，得分：${newScore}分`, 'success')
      }, 1000)
    }
  },

  // 更新学习进度
  updateStudyProgress(progress) {
    try {
      const course = this.data.course
      const learningData = wx.getStorageSync('learningData') || { courses: [] }
      
      // 查找并更新课程进度
      const courseIndex = learningData.courses.findIndex(c => c.id === course.id)
      if (courseIndex !== -1) {
        learningData.courses[courseIndex].progress = progress
        learningData.courses[courseIndex].lastStudyTime = getCurrentDateTime()
      } else {
        // 如果课程不存在，添加新记录
        learningData.courses.unshift({
          id: course.id,
          title: course.title,
          progress: progress,
          lastStudyTime: getCurrentDateTime(),
          enrollTime: getCurrentDateTime()
        })
      }
      
      // 更新统计数据
      const totalProgress = learningData.courses.reduce((sum, c) => sum + c.progress, 0)
      const avgProgress = learningData.courses.length > 0 ? totalProgress / learningData.courses.length : 0
      
      learningData.stats = {
        courses: learningData.courses.length,
        hours: Math.round(learningData.courses.length * 0.5), // 估算学习时长
        score: Math.round(avgProgress),
        certificates: learningData.courses.filter(c => c.progress >= 100).length
      }
      
      wx.setStorageSync('learningData', learningData)
      
      console.log('学习进度已更新:', progress)
    } catch (e) {
      console.error('更新学习进度失败:', e)
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 分享
  onShareAppMessage() {
    const course = this.data.course
    return {
      title: `${course ? course.title : '应急处理学习'} - 造口护理患者端`,
      path: '/pages/education/education'
    }
  }
}) 