// patient-app/pages/diary/diary.js
const app = getApp()
const api = require('../../utils/api.js')
import { formatDate, getCurrentDate, formatDateISO } from '../../utils/dateFormat.js'

Page({
  data: {
    todayDate: '',
    selectedPainLevel: 0,
    selectedSymptoms: [], // 改为多选，使用数组
    symptomNote: '',
    currentFilter: 'all',
    filteredRecords: [],
    weeklyStats: {
      records: 0,
      avgPain: 0,
      trend: '稳定',
      score: 85
    },
    // 编辑相关状态
    isEditing: false,
    editingRecordId: '',
    editingRecord: null,
    painLevels: [
      { level: 1, desc: '轻微' },
      { level: 2, desc: '轻度' },
      { level: 3, desc: '中度' },
      { level: 4, desc: '重度' },
      { level: 5, desc: '剧烈' }
    ],
    symptomTypes: [
      { type: 'pain', name: '疼痛' },
      { type: 'swelling', name: '肿胀' },
      { type: 'redness', name: '发红' },
      { type: 'itching', name: '瘙痒' },
      { type: 'discharge', name: '分泌物' },
      { type: 'odor', name: '异味' }
    ]
  },

  onLoad() {
    console.log('症状日记页面加载')
    console.log('初始数据:', this.data)
    this.initPage()
  },

  onShow() {
    console.log('症状日记页面显示')
    // 每次显示时都刷新数据，确保数据最新
    this.loadData()
  },

  // 初始化页面
  initPage() {
    // 使用统一的时间格式化函数
    const todayDate = getCurrentDate()
    
    // 确保selectedSymptoms是数组
    let selectedSymptoms = this.data.selectedSymptoms || []
    if (!Array.isArray(selectedSymptoms)) {
      console.log('初始化时selectedSymptoms不是数组，初始化为空数组')
      selectedSymptoms = []
    }
    
    // 初始化症状类型的选中状态
    const symptomTypes = this.data.symptomTypes.map(item => ({
      ...item,
      selected: selectedSymptoms.includes(item.type)
    }))
    
    this.setData({
      todayDate,
      selectedSymptoms: selectedSymptoms,
      symptomTypes: symptomTypes
    })
    
    console.log('页面初始化完成，selectedSymptoms:', this.data.selectedSymptoms)
    console.log('symptomTypes:', this.data.symptomTypes)
    this.loadData()
  },

  // 加载数据
  loadData() {
    this.loadRecords()
    this.calculateWeeklyStats()
    console.log('数据加载完成，selectedSymptoms:', this.data.selectedSymptoms)
  },

  // 加载记录
  loadRecords() {
    try {
      const records = wx.getStorageSync('symptomRecords') || []
      this.setData({ records })
      this.filterRecords()
    } catch (e) {
      console.error('加载记录失败:', e)
    }
  },

  // 选择疼痛等级
  selectPainLevel(e) {
    const level = e.currentTarget.dataset.level
    this.setData({
      selectedPainLevel: level
    })
  },

  // 切换症状选择（多选模式）
  toggleSymptom(e) {
    const type = e.currentTarget.dataset.type
    console.log('点击症状类型:', type)
    console.log('点击前的selectedSymptoms:', this.data.selectedSymptoms)
    
    // 确保selectedSymptoms是数组
    let selectedSymptoms = this.data.selectedSymptoms || []
    if (!Array.isArray(selectedSymptoms)) {
      console.log('selectedSymptoms不是数组，初始化为空数组')
      selectedSymptoms = []
    }
    
    console.log('处理后的selectedSymptoms:', selectedSymptoms)
    
    // 检查是否已选中
    const isSelected = selectedSymptoms.includes(type)
    console.log('是否已选中:', isSelected)
    
    if (isSelected) {
      // 如果已选中，则移除
      selectedSymptoms = selectedSymptoms.filter(symptom => symptom !== type)
      console.log('移除症状:', type)
    } else {
      // 如果未选中，则添加
      selectedSymptoms.push(type)
      console.log('添加症状:', type)
    }
    
    console.log('更新后的症状列表:', selectedSymptoms)
    
    // 更新症状类型的选中状态
    const symptomTypes = this.data.symptomTypes.map(item => ({
      ...item,
      selected: selectedSymptoms.includes(item.type)
    }))
    
    // 更新数据
    this.setData({
      selectedSymptoms: selectedSymptoms,
      symptomTypes: symptomTypes
    })
    
    // 验证更新
    setTimeout(() => {
      console.log('验证更新后的数据:', this.data.selectedSymptoms)
      console.log('验证symptomTypes:', this.data.symptomTypes)
    }, 100)
  },

  // 输入备注
  onNoteInput(e) {
    this.setData({
      symptomNote: e.detail.value
    })
  },

  // 提交记录
  async submitRecord() {
    // 如果是编辑模式，调用保存编辑功能
    if (this.data.isEditing) {
      this.saveEdit()
      return
    }
    
    if (this.data.selectedPainLevel === 0) {
      app.showToast('请选择疼痛等级', 'error')
      return
    }
    
    if (this.data.selectedSymptoms.length === 0) {
      app.showToast('请选择症状类型', 'error')
      return
    }
    
    // 显示加载提示
    wx.showLoading({ title: '提交中...' })
    
    // 将选中的症状类型转换为症状名称
    const symptomNames = this.data.selectedSymptoms.map(type => {
      const symptomType = this.data.symptomTypes.find(s => s.type === type)
      return symptomType ? symptomType.name : type
    })
    
    // 准备后端API数据格式
    // 将中文日期格式转换为ISO格式 (YYYY-MM-DD) 供后端使用
    const diaryDate = formatDateISO(new Date())
    
    const diaryData = {
      diaryDate: diaryDate,
      painLevel: this.data.selectedPainLevel,
      symptoms: this.data.selectedSymptoms, // 发送类型数组给后端
      symptomNames: symptomNames, // 症状名称
      notes: this.data.symptomNote || ''
    }
    
    try {
      // 1. 先调用后端API保存
      console.log('调用后端API保存日记:', diaryData)
      const apiRes = await api.createDiary(diaryData)
      
      if (apiRes.success) {
        console.log('后端保存成功:', apiRes.data)
        
        // 2. 保存到本地存储作为缓存
        const record = {
          id: apiRes.data.id || Date.now().toString(),
          date: this.data.todayDate,
          painLevel: this.data.selectedPainLevel,
          symptoms: symptomNames,
          note: this.data.symptomNote,
          timestamp: Date.now(),
          syncedToServer: true // 标记已同步到服务器
        }
        
        const records = wx.getStorageSync('symptomRecords') || []
        records.unshift(record)
        
        // 只保留最近100条记录
        if (records.length > 100) {
          records.splice(100)
        }
        
        wx.setStorageSync('symptomRecords', records)
        
        // 3. 重置表单
        const symptomTypes = this.data.symptomTypes.map(item => ({
          ...item,
          selected: false
        }))
        
        this.setData({
          selectedPainLevel: 0,
          selectedSymptoms: [],
          symptomNote: '',
          records,
          symptomTypes: symptomTypes
        })
        
        this.filterRecords()
        this.calculateWeeklyStats()
        
        // 4. 标记首页需要刷新
        app.globalData.needRefreshIndex = true
        
        wx.hideLoading()
        app.showToast('✅ 记录提交成功', 'success')
      } else {
        throw new Error(apiRes.message || '保存失败')
      }
    } catch (error) {
      console.error('保存记录失败:', error)
      wx.hideLoading()
      
      // 检查是否是重复记录错误（409冲突）
      if (error.statusCode === 409) {
        wx.showModal({
          title: '今日已有记录',
          content: '今天已经有一条日记记录了，是否要更新今天的记录？',
          confirmText: '更新记录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 更新今天的记录
              this.updateTodayRecord(symptomNames, diaryData)
            }
          }
        })
      } else {
        // 其他错误，询问是否只保存到本地
        wx.showModal({
          title: '保存失败',
          content: error.message || '无法连接到服务器，是否仅保存到本地？',
          confirmText: '仅本地保存',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 只保存到本地
              this.saveToLocalOnly(symptomNames)
            }
          }
        })
      }
    }
  },
  
  // 更新今天的记录
  async updateTodayRecord(symptomNames, diaryData) {
    try {
      wx.showLoading({ title: '更新中...' })
      
      // 先获取今天的记录ID
      const patientInfo = wx.getStorageSync('patientInfo')
      if (!patientInfo || !patientInfo.id) {
        throw new Error('获取患者信息失败')
      }
      
      // 查询今天的记录
      const existingRes = await api.getDiaryByDate(patientInfo.id, diaryData.diaryDate)
      
      if (existingRes.success && existingRes.data) {
        const diaryId = existingRes.data.id
        
        // 更新记录
        const updateRes = await api.updateDiary(diaryId, diaryData)
        
        if (updateRes.success) {
          console.log('更新成功:', updateRes.data)
          
          // 更新本地存储
          const record = {
            id: diaryId,
            date: this.data.todayDate,
            painLevel: this.data.selectedPainLevel,
            symptoms: symptomNames,
            note: this.data.symptomNote,
            timestamp: Date.now(),
            syncedToServer: true
          }
          
          const records = wx.getStorageSync('symptomRecords') || []
          // 查找并替换今天的记录
          const todayIndex = records.findIndex(r => r.date === this.data.todayDate)
          if (todayIndex >= 0) {
            records[todayIndex] = record
          } else {
            records.unshift(record)
          }
          
          wx.setStorageSync('symptomRecords', records)
          
          // 重置表单
          const symptomTypes = this.data.symptomTypes.map(item => ({
            ...item,
            selected: false
          }))
          
          this.setData({
            selectedPainLevel: 0,
            selectedSymptoms: [],
            symptomNote: '',
            records,
            symptomTypes: symptomTypes
          })
          
          this.filterRecords()
          this.calculateWeeklyStats()
          
          app.globalData.needRefreshIndex = true
          
          wx.hideLoading()
          app.showToast('✅ 记录更新成功', 'success')
        } else {
          throw new Error(updateRes.message || '更新失败')
        }
      } else {
        throw new Error('未找到今天的记录')
      }
    } catch (error) {
      console.error('更新记录失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '更新失败',
        icon: 'none',
        duration: 2000
      })
    }
  },
  
  // 仅保存到本地
  saveToLocalOnly(symptomNames) {
    try {
      const record = {
        id: Date.now().toString(),
        date: this.data.todayDate,
        painLevel: this.data.selectedPainLevel,
        symptoms: symptomNames,
        note: this.data.symptomNote,
        timestamp: Date.now(),
        syncedToServer: false // 标记未同步到服务器
      }
      
      const records = wx.getStorageSync('symptomRecords') || []
      records.unshift(record)
      
      if (records.length > 100) {
        records.splice(100)
      }
      
      wx.setStorageSync('symptomRecords', records)
      
      // 重置表单
      const symptomTypes = this.data.symptomTypes.map(item => ({
        ...item,
        selected: false
      }))
      
      this.setData({
        selectedPainLevel: 0,
        selectedSymptoms: [],
        symptomNote: '',
        records,
        symptomTypes: symptomTypes
      })
      
      this.filterRecords()
      this.calculateWeeklyStats()
      
      app.showToast('📱 已保存到本地', 'success')
    } catch (e) {
      console.error('本地保存失败:', e)
      app.showToast('保存失败，请重试', 'error')
    }
  },

  // 切换筛选
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter
    })
    this.filterRecords()
  },

  // 筛选记录
  filterRecords() {
    const { records, currentFilter } = this.data
    let filteredRecords = [...records]
    
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    switch (currentFilter) {
      case 'week':
        filteredRecords = records.filter(record => {
          const recordDate = new Date(record.timestamp)
          return recordDate >= weekStart
        })
        break
      case 'month':
        filteredRecords = records.filter(record => {
          const recordDate = new Date(record.timestamp)
          return recordDate >= monthStart
        })
        break
      default:
        // 全部记录
        break
    }
    
    this.setData({
      filteredRecords
    })
  },

  // 计算周统计
  calculateWeeklyStats() {
    const { records } = this.data
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    
    const weekRecords = records.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= weekStart
    })
    
    const avgPain = weekRecords.length > 0 
      ? Math.round(weekRecords.reduce((sum, record) => sum + record.painLevel, 0) / weekRecords.length * 10) / 10
      : 0
    
    const trend = this.calculateTrend(weekRecords)
    const score = this.calculateHealthScore(weekRecords)
    
    this.setData({
      weeklyStats: {
        records: weekRecords.length,
        avgPain,
        trend,
        score
      }
    })
  },

  // 计算趋势
  calculateTrend(records) {
    if (records.length < 2) return '稳定'
    
    const recent = records.slice(0, 3)
    const older = records.slice(3, 6)
    
    if (recent.length === 0 || older.length === 0) return '稳定'
    
    const recentAvg = recent.reduce((sum, r) => sum + r.painLevel, 0) / recent.length
    const olderAvg = older.reduce((sum, r) => sum + r.painLevel, 0) / older.length
    
    if (recentAvg < olderAvg - 0.5) return '改善'
    if (recentAvg > olderAvg + 0.5) return '加重'
    return '稳定'
  },

  // 计算健康评分
  calculateHealthScore(records) {
    if (records.length === 0) return 85
    
    const avgPain = records.reduce((sum, r) => sum + r.painLevel, 0) / records.length
    // 基于5级疼痛系统调整评分：1级疼痛=100分，5级疼痛=60分
    const baseScore = 100 - (avgPain - 1) * 10
    
    return Math.max(60, Math.min(100, Math.round(baseScore)))
  },

  // 编辑记录
  editRecord(e) {
    const id = e.currentTarget.dataset.id
    console.log('编辑记录:', id)
    
    // 查找要编辑的记录
    const record = this.data.records.find(r => r.id === id)
    if (!record) {
      app.showToast('记录不存在', 'error')
      return
    }
    
    // 将症状名称转换为症状类型
    const selectedSymptoms = record.symptoms.map(symptomName => {
      const symptomType = this.data.symptomTypes.find(s => s.name === symptomName)
      return symptomType ? symptomType.type : symptomName
    })
    
    // 更新症状类型的选中状态
    const symptomTypes = this.data.symptomTypes.map(item => ({
      ...item,
      selected: selectedSymptoms.includes(item.type)
    }))
    
    // 设置编辑状态
    this.setData({
      isEditing: true,
      editingRecordId: id,
      editingRecord: record,
      selectedPainLevel: record.painLevel,
      selectedSymptoms: selectedSymptoms,
      symptomNote: record.note || '',
      symptomTypes: symptomTypes
    })
    
    // 滚动到表单区域
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    
    app.showToast('已加载记录数据', 'success')
  },

  // 取消编辑
  cancelEdit() {
    // 重置症状类型的选中状态
    const symptomTypes = this.data.symptomTypes.map(item => ({
      ...item,
      selected: false
    }))
    
    this.setData({
      isEditing: false,
      editingRecordId: '',
      editingRecord: null,
      selectedPainLevel: 0,
      selectedSymptoms: [],
      symptomNote: '',
      symptomTypes: symptomTypes
    })
    
    app.showToast('已取消编辑', 'none')
  },

  // 保存编辑
  saveEdit() {
    if (this.data.selectedPainLevel === 0) {
      app.showToast('请选择疼痛等级', 'error')
      return
    }
    
    if (this.data.selectedSymptoms.length === 0) {
      app.showToast('请选择症状类型', 'error')
      return
    }
    
    // 将选中的症状类型转换为症状名称
    const symptomNames = this.data.selectedSymptoms.map(type => {
      const symptomType = this.data.symptomTypes.find(s => s.type === type)
      return symptomType ? symptomType.name : type
    })
    
    // 更新记录
    const updatedRecord = {
      ...this.data.editingRecord,
      painLevel: this.data.selectedPainLevel,
      symptoms: symptomNames,
      note: this.data.symptomNote
    }
    
    try {
      const records = wx.getStorageSync('symptomRecords') || []
      const recordIndex = records.findIndex(r => r.id === this.data.editingRecordId)
      
      if (recordIndex === -1) {
        app.showToast('记录不存在', 'error')
        return
      }
      
      // 更新记录
      records[recordIndex] = updatedRecord
      wx.setStorageSync('symptomRecords', records)
      
      // 重置症状类型的选中状态
      const symptomTypes = this.data.symptomTypes.map(item => ({
        ...item,
        selected: false
      }))
      
      // 重置编辑状态
      this.setData({
        isEditing: false,
        editingRecordId: '',
        editingRecord: null,
        selectedPainLevel: 0,
        selectedSymptoms: [],
        symptomNote: '',
        records,
        symptomTypes: symptomTypes
      })
      
      this.filterRecords()
      this.calculateWeeklyStats()
      
      app.showToast('编辑保存成功', 'success')
    } catch (e) {
      console.error('保存编辑失败:', e)
      app.showToast('保存失败，请重试', 'error')
    }
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            const records = wx.getStorageSync('symptomRecords') || []
            const newRecords = records.filter(record => record.id !== id)
            wx.setStorageSync('symptomRecords', newRecords)
            
            this.setData({ records: newRecords })
            this.filterRecords()
            this.calculateWeeklyStats()
            
            app.showToast('删除成功', 'success')
          } catch (e) {
            console.error('删除记录失败:', e)
            app.showToast('删除失败，请重试', 'error')
          }
        }
      }
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '症状日记 - 造口护理患者端',
      path: '/pages/diary/diary'
    }
  }
})