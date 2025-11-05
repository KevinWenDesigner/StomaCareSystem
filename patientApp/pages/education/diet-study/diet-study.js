// patient-app/pages/education/diet-study/diet-study.js
const app = getApp()
const api = require('../../../utils/api.js') // 导入API工具，用于后端数据同步
import { getCurrentDateTime } from '../../../utils/dateFormat.js'

Page({
  data: {
    course: null,
    currentChapter: 0,
    loading: true,
    studyProgress: 0,
    isCompleted: false,
    showNutritionCalculator: false,
    showRecipeRecommendation: false,
    useBackendData: true, // 是否使用后端数据（默认开启）
    studyStartTime: null, // 学习开始时间，用于计算学习时长
    nutritionData: {
      weight: 60,
      height: 170,
      age: 45,
      activity: 'moderate',
      bmr: 0,
      dailyCalories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    recipeRecommendations: []
  },

  onLoad() {
    console.log('饮食指导学习页面加载')
    // 记录学习开始时间，用于计算学习时长
    this.setData({
      studyStartTime: Date.now()
    })
    this.loadCourseData()
  },

  onShow() {
    console.log('饮食指导学习页面显示')
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
        
        console.log('加载饮食指导课程数据:', course.title)
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
    
    // 如果是饮食指导课程，显示营养计算器
    if (newProgress >= 100) {
      this.showNutritionCalculator()
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

  // 显示营养计算器
  showNutritionCalculator() {
    this.setData({
      showNutritionCalculator: true
    })
  },

  // 关闭营养计算器
  closeNutritionCalculator() {
    this.setData({
      showNutritionCalculator: false
    })
  },

  // 计算营养需求
  calculateNutrition() {
    const { weight, height, age, activity } = this.data.nutritionData
    
    // 计算基础代谢率 (BMR) - 使用Mifflin-St Jeor公式
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5
    
    // 根据活动水平调整
    let activityMultiplier = 1.2
    switch (activity) {
      case 'sedentary':
        activityMultiplier = 1.2
        break
      case 'light':
        activityMultiplier = 1.375
        break
      case 'moderate':
        activityMultiplier = 1.55
        break
      case 'active':
        activityMultiplier = 1.725
        break
      case 'very_active':
        activityMultiplier = 1.9
        break
    }
    
    const dailyCalories = Math.round(bmr * activityMultiplier)
    
    // 计算营养素分配 (适合造口患者)
    const protein = Math.round(dailyCalories * 0.25 / 4) // 25% 蛋白质
    const carbs = Math.round(dailyCalories * 0.55 / 4)   // 55% 碳水化合物
    const fat = Math.round(dailyCalories * 0.20 / 9)     // 20% 脂肪
    
    this.setData({
      'nutritionData.bmr': Math.round(bmr),
      'nutritionData.dailyCalories': dailyCalories,
      'nutritionData.protein': protein,
      'nutritionData.carbs': carbs,
      'nutritionData.fat': fat
    })
    
    app.showToast('营养需求计算完成', 'success')
  },

  // 更新营养数据
  updateNutritionData(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value
    
    this.setData({
      [`nutritionData.${field}`]: parseFloat(value) || 0
    })
  },

  // 显示食谱推荐
  showRecipeRecommendation() {
    // 生成食谱推荐
    const recommendations = this.generateRecipeRecommendations()
    
    this.setData({
      showRecipeRecommendation: true,
      recipeRecommendations: recommendations
    })
  },

  // 关闭食谱推荐
  closeRecipeRecommendation() {
    this.setData({
      showRecipeRecommendation: false
    })
  },

  // 生成食谱推荐
  generateRecipeRecommendations() {
    return [
      {
        meal: '早餐',
        title: '营养均衡早餐',
        description: '适合造口患者的温和早餐',
        foods: [
          { name: '白粥', amount: '1碗', calories: 120 },
          { name: '蒸蛋羹', amount: '1份', calories: 80 },
          { name: '香蕉', amount: '1根', calories: 105 }
        ],
        totalCalories: 305,
        tips: '避免刺激性食物，选择易消化的食材'
      },
      {
        meal: '午餐',
        title: '蛋白质丰富午餐',
        description: '补充优质蛋白质的午餐搭配',
        foods: [
          { name: '白米饭', amount: '1碗', calories: 200 },
          { name: '清蒸鱼', amount: '100g', calories: 120 },
          { name: '蒸蛋羹', amount: '1份', calories: 80 },
          { name: '清炒青菜', amount: '1份', calories: 50 }
        ],
        totalCalories: 450,
        tips: '选择低脂肪的蛋白质来源，避免油炸食物'
      },
      {
        meal: '晚餐',
        title: '清淡易消化晚餐',
        description: '适合造口患者的温和晚餐',
        foods: [
          { name: '白粥', amount: '1碗', calories: 120 },
          { name: '蒸蛋羹', amount: '1份', calories: 80 },
          { name: '清炒青菜', amount: '1份', calories: 50 },
          { name: '苹果', amount: '1个', calories: 95 }
        ],
        totalCalories: 345,
        tips: '晚餐宜清淡，避免过饱，有助于消化'
      }
    ]
  },

  // 更新学习进度（支持后端同步）
  async updateStudyProgress(progress) {
    try {
      const course = this.data.course
      
      // 计算学习时长（秒）
      const now = Date.now()
      const studyDuration = this.data.studyStartTime ? Math.floor((now - this.data.studyStartTime) / 1000) : 0
      
      // 获取课程ID（支持多种数据结构）
      const courseId = course.rawData?.id || course.id
      
      console.log('准备更新学习进度:', {
        courseId,
        progress,
        studyDuration,
        useBackendData: this.data.useBackendData,
        hasCourseId: !!courseId
      })
      
      if (this.data.useBackendData && courseId) {
        // 同步到后端数据库
        try {
          const progressData = {
            progress: progress,
            lastPosition: 0,
            studyDuration: studyDuration,
            completed: progress >= 100 ? 1 : 0
          }
          
          console.log('调用后端API记录进度:', courseId, progressData)
          const res = await api.recordCourseProgress(courseId, progressData)
          console.log('学习进度已同步到后端:', res)
          
          // 同时保存到本地（作为备份）
          this.updateLocalProgress(progress)
          
          // 显示成功提示
          wx.showToast({
            title: '进度已保存',
            icon: 'success',
            duration: 1500
          })
        } catch (error) {
          console.error('同步进度到后端失败:', error)
          console.error('错误详情:', error.message || error)
          // 失败时仍保存到本地
          this.updateLocalProgress(progress)
          
          // 显示友好提示
          wx.showToast({
            title: '进度已保存到本地',
            icon: 'none',
            duration: 2000
          })
        }
      } else {
        // 仅保存到本地
        console.log('仅保存到本地存储')
        this.updateLocalProgress(progress)
      }
    } catch (e) {
      console.error('更新学习进度失败:', e)
    }
  },
  
  // 更新本地进度（辅助方法）
  updateLocalProgress(progress) {
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
      
      console.log('本地学习进度已更新:', progress)
    } catch (e) {
      console.error('更新本地学习进度失败:', e)
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
      title: `${course ? course.title : '饮食指导学习'} - 造口护理患者端`,
      path: '/pages/education/education'
    }
  }
}) 