// patient-app/pages/education/course-list/course-list.js
const app = getApp()

Page({
  data: {
    categoryName: '',
    courses: [],
    filteredCourses: [],
    searchKeyword: '',
    currentFilter: 'all',
    loading: true
  },

  onLoad() {
    console.log('课程列表页面加载')
    this.loadCategoryData()
  },

  onShow() {
    console.log('课程列表页面显示')
  },

  // 加载分类数据
  loadCategoryData() {
    try {
      console.log('开始加载课程数据')
      const globalData = getApp().globalData
      console.log('全局数据:', globalData)
      
      // 检查是否有所有课程数据
      if (globalData && globalData.allCourses) {
        console.log('获取到所有课程数据:', globalData.allCourses.length)
        
        this.setData({
          categoryName: '全部课程',
          courses: globalData.allCourses,
          filteredCourses: globalData.allCourses,
          loading: false
        })
        
        console.log('数据设置完成:', this.data.categoryName, this.data.courses.length)
      }
      // 检查是否有分类课程数据（向后兼容）
      else if (globalData && globalData.categoryCourses) {
        const { categoryName, courses } = globalData.categoryCourses
        
        console.log('获取到分类数据:', categoryName, courses)
        console.log('课程数组长度:', courses ? courses.length : 'undefined')
        
        if (categoryName && courses && courses.length > 0) {
          this.setData({
            categoryName: categoryName,
            courses: courses,
            filteredCourses: courses,
            loading: false
          })
          
          console.log('数据设置完成:', this.data.categoryName, this.data.courses.length)
        } else {
          console.error('分类数据不完整:', { categoryName, courses })
          app.showToast('数据不完整', 'error')
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      } else {
        console.error('全局数据中没有课程数据')
        app.showToast('数据加载失败', 'error')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (e) {
      console.error('加载课程数据失败:', e)
      app.showToast('数据加载失败', 'error')
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterCourses()
  },

  // 搜索确认
  onSearchConfirm(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterCourses()
  },

  // 设置筛选条件
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter
    })
    this.filterCourses()
  },

  // 筛选课程
  filterCourses() {
    let filtered = this.data.courses

    // 按分类筛选
    if (this.data.currentFilter !== 'all') {
      filtered = filtered.filter(course => {
        if (this.data.currentFilter === 'basic') {
          return course.id.startsWith('basic_') || course.category === 'basic'
        } else if (this.data.currentFilter === 'practice') {
          return course.id.startsWith('practice_') || course.category === 'practice'
        } else if (this.data.currentFilter === 'diet') {
          return course.id.startsWith('diet_') || course.category === 'diet'
        } else if (this.data.currentFilter === 'emergency') {
          return course.id.startsWith('emergency_') || course.category === 'emergency'
        }
        return true
      })
    }

    // 按关键词搜索
    if (this.data.searchKeyword.trim()) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(course => {
        return course.title.toLowerCase().includes(keyword) ||
               course.description.toLowerCase().includes(keyword)
      })
    }

    this.setData({
      filteredCourses: filtered
    })
  },

  // 查看课程详情
  viewCourse(e) {
    const courseId = e.currentTarget.dataset.id
    console.log('查看课程:', courseId)
    
    // 查找课程详情
    const course = this.data.courses.find(c => c.id === courseId)
    if (course) {
      // 存储课程详情到全局数据
      getApp().globalData = getApp().globalData || {}
      getApp().globalData.currentCourse = course
      
      // 跳转到课程详情页面
      wx.navigateTo({
        url: '/pages/education/course-detail/course-detail'
      })
    } else {
      app.showToast('课程不存在', 'error')
    }
  },

  // 开始学习
  startLearning(e) {
    const courseId = e.currentTarget.dataset.id
    console.log('开始学习:', courseId)
    
    // 查找课程详情
    const course = this.data.courses.find(c => c.id === courseId)
    if (course) {
      // 存储课程详情到全局数据
      getApp().globalData = getApp().globalData || {}
      getApp().globalData.currentCourse = course
      
      // 根据课程类型跳转到不同的学习页面
      let targetUrl = '/pages/education/course-study/course-study'
      
      // 如果是实践操作课程，跳转到专门的实践学习页面
      if (courseId && courseId.startsWith('practice_')) {
        targetUrl = '/pages/education/practice-study/practice-study'
      }
      
      // 如果是饮食指导课程，跳转到专门的饮食学习页面
      if (courseId && courseId.startsWith('diet_')) {
        targetUrl = '/pages/education/diet-study/diet-study'
      }
      
      // 如果是应急处理课程，跳转到专门的应急处理学习页面
      if (courseId && courseId.startsWith('emergency_')) {
        targetUrl = '/pages/education/emergency-study/emergency-study'
      }
      
      // 跳转到课程学习页面
      wx.navigateTo({
        url: targetUrl
      })
    } else {
      app.showToast('课程不存在', 'error')
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.categoryName} - 造口护理患者端`,
      path: '/pages/education/education'
    }
  }
}) 