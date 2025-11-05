// patient-app/pages/education/education.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    useBackendData: true, // 是否使用后端数据
    recommendedCourses: [
      {
        id: 'course_001',
        title: '造口护理基础知识',
        description: '学习造口护理的基本概念、分类和护理原则',
        level: 1,
        levelText: '初级',
        duration: '30分钟',
        students: 1250,
        rating: 4.8,
        progress: 0,
        category: 'basic'
      },
      {
        id: 'course_002',
        title: '造口袋更换技巧',
        description: '掌握造口袋的正确更换方法和注意事项',
        level: 2,
        levelText: '中级',
        duration: '45分钟',
        students: 890,
        rating: 4.9,
        progress: 0,
        category: 'practice'
      },
      {
        id: 'course_003',
        title: '造口周围皮肤护理',
        description: '学习预防和处理造口周围皮肤问题的方法',
        level: 2,
        levelText: '中级',
        duration: '40分钟',
        students: 756,
        rating: 4.7,
        progress: 0,
        category: 'practice'
      }
    ],
    // 基础知识课程列表
    basicCourses: [
      {
        id: 'basic_001',
        title: '造口护理概述',
        description: '了解造口护理的基本概念、重要性和基本原则',
        level: 1,
        levelText: '初级',
        duration: '20分钟',
        students: 2150,
        rating: 4.9,
        progress: 0,
        chapters: [
          { id: 1, title: '什么是造口护理', duration: '5分钟', completed: false },
          { id: 2, title: '造口护理的重要性', duration: '8分钟', completed: false },
          { id: 3, title: '护理基本原则', duration: '7分钟', completed: false }
        ]
      },
      {
        id: 'basic_002',
        title: '造口类型与特点',
        description: '学习不同类型造口的特点和护理要点',
        level: 1,
        levelText: '初级',
        duration: '25分钟',
        students: 1890,
        rating: 4.8,
        progress: 0,
        chapters: [
          { id: 1, title: '结肠造口', duration: '8分钟', completed: false },
          { id: 2, title: '回肠造口', duration: '7分钟', completed: false },
          { id: 3, title: '尿路造口', duration: '10分钟', completed: false }
        ]
      },
      {
        id: 'basic_003',
        title: '造口护理用品',
        description: '了解造口护理常用用品的选择和使用方法',
        level: 1,
        levelText: '初级',
        duration: '30分钟',
        students: 1650,
        rating: 4.7,
        progress: 0,
        chapters: [
          { id: 1, title: '造口袋的选择', duration: '10分钟', completed: false },
          { id: 2, title: '皮肤保护用品', duration: '8分钟', completed: false },
          { id: 3, title: '清洁用品', duration: '12分钟', completed: false }
        ]
      },
      {
        id: 'basic_004',
        title: '造口护理环境',
        description: '学习造口护理的环境要求和注意事项',
        level: 1,
        levelText: '初级',
        duration: '15分钟',
        students: 1420,
        rating: 4.6,
        progress: 0,
        chapters: [
          { id: 1, title: '护理环境要求', duration: '6分钟', completed: false },
          { id: 2, title: '卫生注意事项', duration: '5分钟', completed: false },
          { id: 3, title: '安全防护措施', duration: '4分钟', completed: false }
        ]
      }
    ],
    // 实践操作课程列表
    practiceCourses: [
      {
        id: 'practice_001',
        title: '造口袋更换技巧',
        description: '掌握造口袋的正确更换方法和注意事项',
        level: 2,
        levelText: '中级',
        duration: '45分钟',
        students: 890,
        rating: 4.9,
        progress: 0,
        chapters: [
          { id: 1, title: '更换前准备', duration: '8分钟', completed: false },
          { id: 2, title: '清洁造口周围', duration: '12分钟', completed: false },
          { id: 3, title: '测量造口尺寸', duration: '10分钟', completed: false },
          { id: 4, title: '裁剪造口袋', duration: '8分钟', completed: false },
          { id: 5, title: '粘贴造口袋', duration: '7分钟', completed: false }
        ]
      },
      {
        id: 'practice_002',
        title: '造口周围皮肤护理',
        description: '学习预防和处理造口周围皮肤问题的方法',
        level: 2,
        levelText: '中级',
        duration: '40分钟',
        students: 756,
        rating: 4.7,
        progress: 0,
        chapters: [
          { id: 1, title: '皮肤评估', duration: '8分钟', completed: false },
          { id: 2, title: '清洁技巧', duration: '10分钟', completed: false },
          { id: 3, title: '皮肤保护', duration: '12分钟', completed: false },
          { id: 4, title: '问题处理', duration: '10分钟', completed: false }
        ]
      },
      {
        id: 'practice_003',
        title: '造口护理操作流程',
        description: '掌握完整的造口护理操作流程和标准',
        level: 2,
        levelText: '中级',
        duration: '50分钟',
        students: 680,
        rating: 4.8,
        progress: 0,
        chapters: [
          { id: 1, title: '操作前准备', duration: '10分钟', completed: false },
          { id: 2, title: '清洁流程', duration: '15分钟', completed: false },
          { id: 3, title: '更换流程', duration: '15分钟', completed: false },
          { id: 4, title: '后续护理', duration: '10分钟', completed: false }
        ]
      },
      {
        id: 'practice_004',
        title: '造口并发症处理',
        description: '学习常见造口并发症的识别和处理方法',
        level: 3,
        levelText: '高级',
        duration: '60分钟',
        students: 520,
        rating: 4.6,
        progress: 0,
        chapters: [
          { id: 1, title: '并发症识别', duration: '15分钟', completed: false },
          { id: 2, title: '皮肤问题处理', duration: '20分钟', completed: false },
          { id: 3, title: '造口问题处理', duration: '15分钟', completed: false },
          { id: 4, title: '紧急情况处理', duration: '10分钟', completed: false }
        ]
      },
      {
        id: 'practice_005',
        title: '造口护理技能训练',
        description: '通过模拟训练提升造口护理操作技能',
        level: 2,
        levelText: '中级',
        duration: '35分钟',
        students: 420,
        rating: 4.5,
        progress: 0,
        chapters: [
          { id: 1, title: '模拟训练准备', duration: '8分钟', completed: false },
          { id: 2, title: '基础技能训练', duration: '12分钟', completed: false },
          { id: 3, title: '进阶技能训练', duration: '10分钟', completed: false },
          { id: 4, title: '技能评估', duration: '5分钟', completed: false }
        ]
      }
    ],
    // 饮食指导课程列表
    dietCourses: [
      {
        id: 'diet_001',
        title: '造口患者饮食原则',
        description: '了解造口患者的基本饮食原则和注意事项',
        level: 1,
        levelText: '初级',
        duration: '25分钟',
        students: 1680,
        rating: 4.8,
        progress: 0,
        chapters: [
          { id: 1, title: '饮食基本原则', duration: '8分钟', completed: false },
          { id: 2, title: '营养需求分析', duration: '10分钟', completed: false },
          { id: 3, title: '饮食禁忌', duration: '7分钟', completed: false }
        ]
      },
      {
        id: 'diet_002',
        title: '造口患者营养搭配',
        description: '学习适合造口患者的营养搭配方案',
        level: 2,
        levelText: '中级',
        duration: '35分钟',
        students: 1420,
        rating: 4.7,
        progress: 0,
        chapters: [
          { id: 1, title: '蛋白质搭配', duration: '12分钟', completed: false },
          { id: 2, title: '维生素补充', duration: '10分钟', completed: false },
          { id: 3, title: '矿物质平衡', duration: '8分钟', completed: false },
          { id: 4, title: '膳食纤维', duration: '5分钟', completed: false }
        ]
      },
      {
        id: 'diet_003',
        title: '造口患者食谱设计',
        description: '掌握造口患者的一日三餐食谱设计',
        level: 2,
        levelText: '中级',
        duration: '40分钟',
        students: 1180,
        rating: 4.6,
        progress: 0,
        chapters: [
          { id: 1, title: '早餐设计', duration: '12分钟', completed: false },
          { id: 2, title: '午餐搭配', duration: '15分钟', completed: false },
          { id: 3, title: '晚餐安排', duration: '10分钟', completed: false },
          { id: 4, title: '加餐建议', duration: '3分钟', completed: false }
        ]
      },
      {
        id: 'diet_004',
        title: '造口并发症饮食调理',
        description: '学习针对不同造口并发症的饮食调理方法',
        level: 3,
        levelText: '高级',
        duration: '45分钟',
        students: 890,
        rating: 4.5,
        progress: 0,
        chapters: [
          { id: 1, title: '腹泻调理', duration: '15分钟', completed: false },
          { id: 2, title: '便秘调理', duration: '12分钟', completed: false },
          { id: 3, title: '皮肤问题调理', duration: '10分钟', completed: false },
          { id: 4, title: '营养缺乏调理', duration: '8分钟', completed: false }
        ]
      },
      {
        id: 'diet_005',
        title: '造口患者饮食禁忌',
        description: '了解造口患者需要避免的食物和注意事项',
        level: 1,
        levelText: '初级',
        duration: '30分钟',
        students: 1560,
        rating: 4.9,
        progress: 0,
        chapters: [
          { id: 1, title: '刺激性食物', duration: '10分钟', completed: false },
          { id: 2, title: '高纤维食物', duration: '8分钟', completed: false },
          { id: 3, title: '产气食物', duration: '7分钟', completed: false },
          { id: 4, title: '过敏食物', duration: '5分钟', completed: false }
        ]
      }
    ],
    // 应急处理课程列表
    emergencyCourses: [
      {
        id: 'emergency_001',
        title: '造口出血应急处理',
        description: '学习造口出血的识别、评估和紧急处理方法',
        level: 2,
        levelText: '中级',
        duration: '30分钟',
        students: 1250,
        rating: 4.8,
        progress: 0,
        chapters: [
          { id: 1, title: '出血症状识别', duration: '8分钟', completed: false },
          { id: 2, title: '出血程度评估', duration: '10分钟', completed: false },
          { id: 3, title: '紧急处理步骤', duration: '12分钟', completed: false }
        ]
      },
      {
        id: 'emergency_002',
        title: '造口脱垂应急处理',
        description: '掌握造口脱垂的识别和紧急处理技巧',
        level: 3,
        levelText: '高级',
        duration: '35分钟',
        students: 980,
        rating: 4.7,
        progress: 0,
        chapters: [
          { id: 1, title: '脱垂症状识别', duration: '10分钟', completed: false },
          { id: 2, title: '脱垂程度评估', duration: '8分钟', completed: false },
          { id: 3, title: '紧急复位技巧', duration: '12分钟', completed: false },
          { id: 4, title: '预防措施', duration: '5分钟', completed: false }
        ]
      },
      {
        id: 'emergency_003',
        title: '造口感染应急处理',
        description: '学习造口感染的识别和紧急处理方法',
        level: 2,
        levelText: '中级',
        duration: '25分钟',
        students: 1100,
        rating: 4.6,
        progress: 0,
        chapters: [
          { id: 1, title: '感染症状识别', duration: '8分钟', completed: false },
          { id: 2, title: '感染程度评估', duration: '7分钟', completed: false },
          { id: 3, title: '紧急处理措施', duration: '10分钟', completed: false }
        ]
      },
      {
        id: 'emergency_004',
        title: '造口梗阻应急处理',
        description: '掌握造口梗阻的识别和紧急处理技巧',
        level: 3,
        levelText: '高级',
        duration: '40分钟',
        students: 850,
        rating: 4.5,
        progress: 0,
        chapters: [
          { id: 1, title: '梗阻症状识别', duration: '10分钟', completed: false },
          { id: 2, title: '梗阻原因分析', duration: '8分钟', completed: false },
          { id: 3, title: '紧急处理步骤', duration: '15分钟', completed: false },
          { id: 4, title: '预防措施', duration: '7分钟', completed: false }
        ]
      },
      {
        id: 'emergency_005',
        title: '造口皮肤问题应急处理',
        description: '学习造口周围皮肤问题的紧急处理方法',
        level: 2,
        levelText: '中级',
        duration: '30分钟',
        students: 1200,
        rating: 4.7,
        progress: 0,
        chapters: [
          { id: 1, title: '皮肤问题识别', duration: '8分钟', completed: false },
          { id: 2, title: '问题程度评估', duration: '7分钟', completed: false },
          { id: 3, title: '紧急护理措施', duration: '10分钟', completed: false },
          { id: 4, title: '预防和护理', duration: '5分钟', completed: false }
        ]
      }
    ],
    learningStats: {
      courses: 0,
      hours: 0,
      score: 0,
      certificates: 0
    },
    recentCourses: []
  },

  onLoad() {
    console.log('护理教育页面加载')
    this.loadLearningData()
  },

  onShow() {
    console.log('护理教育页面显示')
    this.loadLearningData()
  },

  // 加载学习数据
  async loadLearningData() {
    if (this.data.useBackendData) {
      await this.loadFromBackend()
    } else {
      this.loadFromLocal()
    }
  },

  // 从后端加载数据
  async loadFromBackend() {
    try {
      // 1. 获取课程列表
      const coursesRes = await api.getCourses({ page: 1, pageSize: 50 })
      console.log('获取课程列表响应:', coursesRes)
      
      if (coursesRes.success) {
        // 处理分页响应格式: {success, data: [...], pagination: {...}}
        const courses = Array.isArray(coursesRes.data) ? coursesRes.data : 
                       (coursesRes.data && Array.isArray(coursesRes.data.records)) ? coursesRes.data.records : []
        
        console.log('解析的课程数据:', courses)
        
        // 将课程数据转换为前端格式，并按分类分组
        if (courses.length > 0) {
          // 转换课程数据的通用函数
          const convertCourse = (course) => ({
            id: course.id,  // 使用后端的数字ID
            title: course.title,
            description: course.description,
            level: course.difficulty === 'beginner' ? 1 : (course.difficulty === 'intermediate' ? 2 : 3),
            levelText: course.difficulty === 'beginner' ? '初级' : (course.difficulty === 'intermediate' ? '中级' : '高级'),
            duration: course.duration ? `${Math.ceil(course.duration / 60)}分钟` : '30分钟',
            students: course.view_count || course.viewCount || 0,
            rating: 4.8,
            progress: 0,
            category: this.mapCategoryIdToType(course.category_id || course.categoryId),
            rawData: course  // 保存原始数据，包含真实的数字ID
          })
          
          // 按分类分组
          const basicCourses = []
          const practiceCourses = []
          const dietCourses = []
          const emergencyCourses = []
          const psychologyCourses = []
          
          courses.forEach(course => {
            const converted = convertCourse(course)
            const categoryId = course.category_id || course.categoryId
            
            switch(categoryId) {
              case 1:
                basicCourses.push(converted)
                break
              case 2:
                practiceCourses.push(converted)
                break
              case 3:
                dietCourses.push(converted)
                break
              case 4:
                emergencyCourses.push(converted)
                break
              case 5:
                psychologyCourses.push(converted)
                break
              default:
                console.warn('未知的课程分类ID:', categoryId)
            }
          })
          
          // 更新推荐课程（取前3个）
          const recommendedCourses = courses.slice(0, 3).map(convertCourse)
          
          console.log('转换后的推荐课程:', recommendedCourses)
          console.log('基础知识课程:', basicCourses.length)
          console.log('实践操作课程:', practiceCourses.length)
          console.log('饮食指导课程:', dietCourses.length)
          console.log('应急处理课程:', emergencyCourses.length)
          
          // 更新所有课程数据
          this.setData({ 
            recommendedCourses,
            basicCourses,
            practiceCourses,
            dietCourses,
            emergencyCourses,
            psychologyCourses
          })
        }
      }

      // 2. 获取学习记录
      const learningRes = await api.getMyLearning()
      console.log('获取学习记录响应:', learningRes)
      
      if (learningRes.success && learningRes.data) {
        // 后端返回格式: {success, data: {records: [...], stats: {...}, pagination: {...}}}
        const records = learningRes.data.records || []
        const stats = learningRes.data.stats || {}
        
        console.log('学习记录:', records)
        console.log('学习统计:', stats)
        
        const recentCourses = records.slice(0, 3).map(record => ({
          id: record.course_id || record.courseId,
          title: record.title,
          progress: record.progress || 0,
          lastStudyAt: record.last_study_at || record.lastStudyAt,
          duration: record.duration ? `${Math.ceil(record.duration / 60)}分钟` : '',
          coverImage: record.cover_image || record.coverImage
        }))
        
        // 计算统计数据
        const learningStats = {
          courses: stats.total_courses || stats.totalCourses || records.length,
          hours: stats.total_duration ? Math.ceil((stats.total_duration || stats.totalDuration) / 3600) : 0,
          score: 0,
          certificates: stats.completed_courses || stats.completedCourses || records.filter(r => r.completed).length
        }
        
        console.log('最近学习的课程:', recentCourses)
        console.log('学习统计数据:', learningStats)
        
        this.setData({
          learningStats,
          recentCourses
        })
      }

      // 更新推荐课程的进度
      this.updateCourseProgress()
    } catch (error) {
      console.error('从后端加载学习数据失败:', error)
      // 如果后端失败，使用本地数据
      this.loadFromLocal()
    }
  },

  // 从本地加载数据
  loadFromLocal() {
    try {
      const learningData = wx.getStorageSync('learningData') || {
        courses: [],
        stats: {
          courses: 0,
          hours: 0,
          score: 0,
          certificates: 0
        }
      }
      
      this.setData({
        learningStats: learningData.stats,
        recentCourses: learningData.courses.slice(0, 3)
      })
      
      // 更新推荐课程的进度
      this.updateCourseProgress()
    } catch (e) {
      console.error('加载学习数据失败:', e)
    }
  },

  // 更新课程进度
  updateCourseProgress() {
    try {
      const learningData = wx.getStorageSync('learningData') || { courses: [] }
      const recommendedCourses = this.data.recommendedCourses.map(course => {
        const userCourse = learningData.courses.find(c => c.id === course.id)
        return {
          ...course,
          progress: userCourse ? userCourse.progress : 0
        }
      })
      
      this.setData({ recommendedCourses })
    } catch (e) {
      console.error('更新课程进度失败:', e)
    }
  },

  // 选择课程分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    console.log('选择分类:', category)
    console.log('事件对象:', e)
    
    // 先显示一个简单的提示，确认点击事件被触发
    app.showToast(`点击了${this.getCategoryName(category)}`, 'none')
    
    if (category === 'basic' || category === 'practice' || category === 'diet' || category === 'emergency') {
      // 跳转到课程列表页面
      console.log(`准备跳转到${this.getCategoryName(category)}课程列表`)
      let coursesData
      switch (category) {
        case 'basic':
          coursesData = this.data.basicCourses
          break
        case 'practice':
          coursesData = this.data.practiceCourses
          break
        case 'diet':
          coursesData = this.data.dietCourses
          break
        case 'emergency':
          coursesData = this.data.emergencyCourses
          break
      }
      console.log(`${category}Courses数据:`, coursesData)
      this.navigateToCategoryCourses(category)
    } else {
      app.showToast(`选择了${this.getCategoryName(category)}分类`, 'none')
    }
  },

  // 跳转到分类课程列表
  navigateToCategoryCourses(category) {
    const categoryName = this.getCategoryName(category)
    const courses = this.getCoursesByCategory(category)
    
    console.log('分类名称:', categoryName)
    console.log('课程数量:', courses.length)
    console.log('课程数据:', courses)
    console.log('this.data.basicCourses:', this.data.basicCourses)
    
    // 将课程数据存储到全局数据，供下一个页面使用
    getApp().globalData = getApp().globalData || {}
    getApp().globalData.categoryCourses = {
      categoryName: categoryName,
      courses: courses
    }
    
    console.log('全局数据已设置:', getApp().globalData.categoryCourses)
    console.log('全局数据完整内容:', getApp().globalData)
    
    // 跳转到课程列表页面
    wx.navigateTo({
      url: '/pages/education/course-list/course-list',
      success: (res) => {
        console.log('页面跳转成功:', res)
      },
      fail: (err) => {
        console.error('页面跳转失败:', err)
        app.showToast('页面跳转失败', 'error')
      }
    })
  },

  // 根据分类获取课程
  getCoursesByCategory(category) {
    switch (category) {
      case 'basic':
        return this.data.basicCourses
      case 'practice':
        return this.data.practiceCourses
      case 'diet':
        return this.data.dietCourses
      case 'emergency':
        return this.data.emergencyCourses
      default:
        return []
    }
  },

  // 映射分类ID到分类类型
  mapCategoryIdToType(categoryId) {
    // 根据数据库初始化脚本中的分类ID映射
    const categoryMap = {
      1: 'basic',      // 基础护理
      2: 'practice',   // 实操技巧
      3: 'diet',       // 饮食指导
      4: 'emergency',  // 应急处理
      5: 'psychology'  // 心理康复
    }
    return categoryMap[categoryId] || 'basic'
  },

  // 获取分类名称
  getCategoryName(category) {
    const categoryMap = {
      basic: '基础知识',
      practice: '实践操作',
      diet: '饮食指导',
      emergency: '应急处理'
    }
    return categoryMap[category] || '未知分类'
  },

  // 查看课程详情
  viewCourse(e) {
    const courseId = e.currentTarget.dataset.id
    console.log('查看课程:', courseId)
    
    // 查找课程详情
    const course = this.findCourseById(courseId)
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

  // 根据ID查找课程
  findCourseById(courseId) {
    // 在所有课程中查找
    const allCourses = [
      ...this.data.recommendedCourses,
      ...this.data.basicCourses,
      ...this.data.practiceCourses,
      ...this.data.dietCourses,
      ...this.data.emergencyCourses
    ]
    return allCourses.find(course => course.id === courseId)
  },

  // 继续学习
  continueLearning(e) {
    const courseId = e.currentTarget.dataset.id
    console.log('继续学习:', courseId)
    
    // 查找课程详情
    const course = this.findCourseById(courseId)
    if (course) {
      // 存储课程详情到全局数据
      getApp().globalData = getApp().globalData || {}
      getApp().globalData.currentCourse = course
      
      // 跳转到课程学习页面
      wx.navigateTo({
        url: '/pages/education/course-study/course-study'
      })
    } else {
      app.showToast('课程不存在', 'error')
    }
  },

  // 查看全部课程
  viewAllCourses() {
    console.log('查看全部课程')
    
    // 收集所有课程数据
    const allCourses = [
      ...this.data.recommendedCourses,
      ...this.data.basicCourses,
      ...this.data.practiceCourses,
      ...this.data.dietCourses,
      ...this.data.emergencyCourses
    ]
    
    // 存储到全局数据
    getApp().globalData = getApp().globalData || {}
    getApp().globalData.allCourses = allCourses
    
    // 跳转到课程列表页面
    wx.navigateTo({
      url: '/pages/education/course-list/course-list'
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '护理教育 - 造口护理患者端',
      path: '/pages/education/education'
    }
  }
})