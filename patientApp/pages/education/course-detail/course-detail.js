// patient-app/pages/education/course-detail/course-detail.js
const app = getApp()
const api = require('../../../utils/api.js')
import { getCurrentDateTime } from '../../../utils/dateFormat.js'

Page({
  data: {
    course: null,
    loading: true,
    userProgress: 0,
    isEnrolled: false,
    useBackendData: true, // 是否使用后端数据
    isLiked: false, // 是否已点赞
    likeCount: 0 // 点赞数
  },

  onLoad(options) {
    console.log('课程详情页面加载')
    const { courseId } = options
    if (courseId) {
      // 如果有courseId参数，从后端加载
      this.loadCourseFromBackend(courseId)
    } else {
      // 否则从全局数据加载
      this.loadCourseData()
    }
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
        
        // 检查是否已点赞
        const isLiked = this.checkIfLiked(course.id)
        
        this.setData({
          course: course,
          isLiked: isLiked,
          likeCount: course.likeCount || 0,
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

  // 从后端加载课程
  async loadCourseFromBackend(courseId) {
    try {
      wx.showLoading({ title: '加载中...' })
      
      const res = await api.getCourseDetail(courseId)
      console.log('课程详情响应:', res)
      
      if (res.success && res.data) {
        const course = res.data
        const learningRecord = course.learningRecord || {}
        
        this.setData({
          course: course,
          userProgress: learningRecord.progress || 0,
          isEnrolled: !!learningRecord.id,
          likeCount: course.likeCount || course.like_count || 0,
          loading: false
        })
        
        // 保存到全局数据
        getApp().globalData.currentCourse = course
      }
      
      wx.hideLoading()
    } catch (error) {
      console.error('从后端加载课程失败:', error)
      wx.hideLoading()
      // 回退到本地数据
      this.loadCourseData()
    }
  },

  // 加载用户学习进度
  async loadUserProgress(courseId) {
    if (!this.data.useBackendData) {
      // 使用本地数据
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
    }
  },

  // 开始学习课程
  async startLearning() {
    const course = this.data.course
    if (!course) {
      app.showToast('课程数据错误', 'error')
      return
    }
    
    try {
      // 获取课程ID（支持多种数据结构）
      const courseId = course.rawData?.id || course.id
      
      console.log('开始学习课程:', {
        courseId,
        title: course.title,
        useBackendData: this.data.useBackendData
      })
      
      // 如果使用后端数据且有课程ID，先创建学习记录
      if (this.data.useBackendData && courseId) {
        try {
          console.log('调用后端API创建初始学习记录')
          const progressData = {
            progress: 0,
            lastPosition: 0,
            studyDuration: 0,
            completed: 0
          }
          
          await api.recordCourseProgress(courseId, progressData)
          console.log('初始学习记录创建成功')
        } catch (error) {
          console.error('创建后端学习记录失败:', error)
          // 失败不影响继续学习，只记录到本地
        }
      }
      
      // 本地存储
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

  // 点赞课程
  async likeCourse() {
    const course = this.data.course
    if (!course) {
      app.showToast('课程数据错误', 'error')
      return
    }
    
    // 防止重复点赞
    if (this.data.isLiked) {
      app.showToast('您已经点赞过了', 'none')
      return
    }
    
    try {
      const courseId = course.rawData?.id || course.id
      
      if (this.data.useBackendData && courseId) {
        // 调用后端API点赞
        wx.showLoading({ title: '点赞中...' })
        const res = await api.likeCourse(courseId)
        wx.hideLoading()
        
        if (res.success) {
          // 更新点赞状态和数量
          this.setData({
            isLiked: true,
            likeCount: this.data.likeCount + 1
          })
          
          // 震动反馈
          wx.vibrateShort({
            type: 'light'
          })
          
          app.showToast('点赞成功', 'success')
          console.log('课程点赞成功')
        } else {
          app.showToast(res.message || '点赞失败', 'none')
        }
      } else {
        // 仅更新本地状态
        this.setData({
          isLiked: true,
          likeCount: this.data.likeCount + 1
        })
        
        // 保存到本地
        try {
          const likedCourses = wx.getStorageSync('likedCourses') || []
          if (!likedCourses.includes(course.id)) {
            likedCourses.push(course.id)
            wx.setStorageSync('likedCourses', likedCourses)
          }
        } catch (e) {
          console.error('保存点赞到本地失败:', e)
        }
        
        wx.vibrateShort({ type: 'light' })
        app.showToast('点赞成功', 'success')
      }
    } catch (error) {
      console.error('点赞课程失败:', error)
      wx.hideLoading()
      app.showToast('点赞失败，请重试', 'error')
    }
  },

  // 检查是否已点赞
  checkIfLiked(courseId) {
    try {
      const likedCourses = wx.getStorageSync('likedCourses') || []
      return likedCourses.includes(courseId)
    } catch (e) {
      console.error('检查点赞状态失败:', e)
      return false
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