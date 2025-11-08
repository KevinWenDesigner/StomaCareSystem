// patient-app/pages/education/course-study/course-study.js
const app = getApp()
const api = require('../../../utils/api.js')
import { getCurrentDateTime } from '../../../utils/dateFormat.js'

Page({
  data: {
    course: null,
    currentChapter: 0,
    loading: true,
    studyProgress: 0,
    isCompleted: false,
    useBackendData: true, // 是否使用后端数据
    studyStartTime: null, // 学习开始时间
    currentChapterStartTime: null // 当前章节开始时间
  },

  onShow() {
    console.log('课程学习页面显示')
  },

  // 加载课程数据
  async loadCourseData(courseId) {
    try {
      const globalData = getApp().globalData
      let course = globalData && globalData.currentCourse
      
      // 如果全局数据中的课程没有chapters或章节内容为空，从后端加载
      if (course && (!course.chapters || course.chapters.length === 0 || !course.chapters[0].content)) {
        console.log('课程缺少详细内容，从后端加载...')
        try {
          wx.showLoading({ title: '加载内容...' })
          const res = await api.getCourseDetail(course.rawData?.id || course.id)
          if (res.success && res.data) {
            course = res.data
            // 更新全局数据
            getApp().globalData.currentCourse = course
            console.log('从后端加载课程详情成功，章节数:', course.chapters?.length)
          }
          wx.hideLoading()
        } catch (error) {
          console.error('从后端加载课程详情失败:', error)
          wx.hideLoading()
        }
      }
      
      if (course) {
        // 处理章节数据格式
        if (course.chapters && course.chapters.length > 0) {
          course.chapters = course.chapters.map((chapter, index) => {
            // 解析learning_points（可能是JSON字符串）
            let learningPoints = chapter.learning_points || chapter.learningPoints
            if (typeof learningPoints === 'string') {
              try {
                learningPoints = JSON.parse(learningPoints)
              } catch (e) {
                console.error('解析学习要点失败:', e)
                learningPoints = []
              }
            }
            
            return {
              id: chapter.id || (index + 1),
              title: chapter.title,
              content: chapter.content,
              duration: chapter.duration || 300,
              completed: chapter.completed || false,
              learning_points: learningPoints
            }
          })
        }
        
        this.setData({
          course: course,
          loading: false
        })
        
        // 加载学习进度
        this.loadStudyProgress(course.id)
        
        console.log('加载课程学习数据:', course.title)
        console.log('章节数量:', course.chapters?.length)
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
      currentChapter: chapterIndex,
      currentChapterStartTime: Date.now()
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
    
    // 如果还有下一章，自动进入下一章
    if (currentChapter + 1 < totalChapters) {
      setTimeout(() => {
        this.setData({
          currentChapter: currentChapter + 1
        })
        app.showToast(`进入第${currentChapter + 2}章`, 'none')
      }, 1000)
    } else {
      // 课程完成
      setTimeout(() => {
        app.showToast('恭喜！课程学习完成', 'success')
      }, 1000)
    }
  },

  // 更新学习进度
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
        // 同步到后端
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
          
          // 同时保存到本地
          this.updateLocalProgress(progress)
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

  // 更新本地进度
  updateLocalProgress(progress) {
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
    
    console.log('学习进度已更新到本地:', progress)
  },

  onLoad(options) {
    console.log('课程学习页面加载')
    const { courseId } = options
    
    // 记录学习开始时间
    this.setData({
      studyStartTime: Date.now()
    })
    
    if (courseId) {
      this.loadCourseData(courseId)
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
      title: `${course ? course.title : '课程学习'} - 造口护理患者端`,
      path: '/pages/education/education'
    }
  }
}) 