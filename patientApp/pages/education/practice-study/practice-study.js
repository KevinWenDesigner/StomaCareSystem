// patient-app/pages/education/practice-study/practice-study.js
const app = getApp()
import { getCurrentDateTime } from '../../../utils/dateFormat.js'

Page({
  data: {
    course: null,
    currentChapter: 0,
    loading: true,
    studyProgress: 0,
    isCompleted: false,
    showSkillAssessment: false,
    skillScore: 0,
    practiceMode: false
  },

  onLoad() {
    console.log('实践操作学习页面加载')
    this.loadCourseData()
  },

  onShow() {
    console.log('实践操作学习页面显示')
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
        
        console.log('加载实践操作课程数据:', course.title)
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
    
    // 如果是实践操作课程，显示技能评估
    if (newProgress >= 100) {
      this.showSkillAssessment()
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

  // 显示技能评估
  showSkillAssessment() {
    this.setData({
      showSkillAssessment: true
    })
  },

  // 开始技能评估
  startSkillAssessment() {
    this.setData({
      practiceMode: true
    })
    
    app.showToast('开始技能评估', 'none')
  },

  // 完成技能评估
  completeSkillAssessment() {
    const score = Math.floor(Math.random() * 30) + 70 // 模拟评分70-100
    
    this.setData({
      skillScore: score,
      practiceMode: false
    })
    
    app.showToast(`技能评估完成，得分：${score}分`, 'success')
  },

  // 关闭技能评估
  closeSkillAssessment() {
    this.setData({
      showSkillAssessment: false,
      skillScore: 0
    })
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
      title: `${course ? course.title : '实践操作学习'} - 造口护理患者端`,
      path: '/pages/education/education'
    }
  }
}) 