// patient-app/pages/education/course-detail/course-detail.js
const app = getApp()
import { getCurrentDateTime } from '../../../utils/dateFormat.js'

Page({
  data: {
    course: null,
    loading: true,
    userProgress: 0,
    isEnrolled: false
  },

  onLoad() {
    console.log('课程详情页面加载')
    this.loadCourseData()
  },

  onShow() {
    console.log('课程详情页面显示')
  },

  // 加载课程数据
  loadCourseData() {
    try {
      const globalData = getApp().globalData
      if (globalData && globalData.currentCourse) {
        const course = globalData.currentCourse
        
        // 获取用户学习进度
        this.loadUserProgress(course.id)
        
        this.setData({
          course: course,
          loading: false
        })
        
        console.log('加载课程详情:', course.title)
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

  // 加载用户学习进度
  loadUserProgress(courseId) {
    try {
      const learningData = wx.getStorageSync('learningData') || { courses: [] }
      const userCourse = learningData.courses.find(c => c.id === courseId)
      
      if (userCourse) {
        this.setData({
          userProgress: userCourse.progress || 0,
          isEnrolled: true
        })
      } else {
        this.setData({
          userProgress: 0,
          isEnrolled: false
        })
      }
    } catch (e) {
      console.error('加载用户进度失败:', e)
    }
  },

  // 开始学习课程
  startLearning() {
    const course = this.data.course
    if (!course) {
      app.showToast('课程数据错误', 'error')
      return
    }
    
    try {
      const learningData = wx.getStorageSync('learningData') || { courses: [] }
      
      // 检查是否已经报名
      const existingCourse = learningData.courses.find(c => c.id === course.id)
      if (!existingCourse) {
        // 添加新课程记录
        learningData.courses.unshift({
          id: course.id,
          title: course.title,
          progress: 0,
          lastStudyTime: getCurrentDateTime(),
          enrollTime: getCurrentDateTime()
        })
        
        wx.setStorageSync('learningData', learningData)
        app.showToast('报名成功', 'success')
      }
      
      // 跳转到学习页面
      wx.navigateTo({
        url: `/pages/education/course-study/course-study?courseId=${course.id}`
      })
    } catch (e) {
      console.error('开始学习失败:', e)
      app.showToast('开始学习失败', 'error')
    }
  },

  // 报名课程
  enrollCourse() {
    try {
      const course = this.data.course
      const learningData = wx.getStorageSync('learningData') || { 
        courses: [],
        stats: {
          courses: 0,
          hours: 0,
          score: 0,
          certificates: 0
        }
      }
      
      // 检查是否已经报名
      const existingCourse = learningData.courses.find(c => c.id === course.id)
      if (!existingCourse) {
        // 添加新课程到学习记录
        const newCourse = {
          id: course.id,
          title: course.title,
          progress: 0,
          lastStudyTime: getCurrentDateTime(),
          enrollTime: getCurrentDateTime()
        }
        
        learningData.courses.unshift(newCourse)
        
        // 更新统计数据
        learningData.stats.courses = learningData.courses.length
        
        wx.setStorageSync('learningData', learningData)
        
        this.setData({
          isEnrolled: true,
          userProgress: 0
        })
        
        app.showToast('报名成功', 'success')
      }
    } catch (e) {
      console.error('报名课程失败:', e)
      app.showToast('报名失败，请重试', 'error')
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 分享课程
  onShareAppMessage() {
    const course = this.data.course
    return {
      title: `${course ? course.title : '课程详情'} - 造口护理患者端`,
      path: '/pages/education/education'
    }
  }
}) 