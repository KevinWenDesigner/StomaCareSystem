// patient-app/pages/camera/history/history.js
const app = getApp()
const api = require('../../../utils/api.js')
import { formatDateTime, getRelativeTime, formatDate } from '../../../utils/dateFormat.js'

Page({
  data: {
    historyList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    averageScore: 0,
    latestRecord: '暂无',
    useBackendData: true // 是否使用后端数据
  },

  onLoad() {
    console.log('历史评估记录页面加载')
    this.loadHistoryData()
  },

  onShow() {
    console.log('历史评估记录页面显示')
    this.loadHistoryData()
  },

  // 加载历史数据
  async loadHistoryData() {
    this.setData({ loading: true })
    
    // 优先从后端加载
    if (this.data.useBackendData) {
      await this.loadFromBackend()
    } else {
      this.loadFromLocal()
    }
  },

  // 从后端加载评估历史
  async loadFromBackend() {
    try {
      console.log('从后端加载评估历史...')
      const res = await api.getAssessments({
        page: this.data.page,
        pageSize: this.data.pageSize
      })
      
      if (res.success && res.data) {
        const backendData = Array.isArray(res.data) ? res.data : []
        const config = require('../../../config.js')
        
        // 转换后端数据格式为前端需要的格式
        const historyList = backendData.map(item => {
          const imageUrl = item.imageUrl || item.image_url
          // 拼接完整的服务器URL
          const fullImageUrl = imageUrl 
            ? (imageUrl.startsWith('http') 
                ? imageUrl 
                : `${config.apiBaseUrl.replace('/api', '')}${imageUrl}`)
            : ''
          
          console.log('图片URL转换:', imageUrl, '→', fullImageUrl)
          
          return {
            id: item.id,
            photoPath: fullImageUrl,  // 使用完整的服务器URL
            imageUrl: imageUrl,  // 保留原始相对路径
            time: item.createdAt || item.created_at,
            score: this.calculateScore(item.riskLevel || item.risk_level),
            level: item.riskLevel || item.risk_level,
            levelText: this.getRiskLevelText(item.riskLevel || item.risk_level),
            description: item.suggestions || item.stomaColor || '暂无描述',
            stomaColor: item.stomaColor || item.stoma_color,
            stomaSize: item.stomaSize || item.stoma_size,
            skinCondition: item.skinCondition || item.skin_condition,
            rawData: item
          }
        })
        
        // 按时间倒序排列
        historyList.sort((a, b) => new Date(b.time) - new Date(a.time))
        
        // 计算统计数据
        const averageScore = historyList.length > 0 
          ? Math.round(historyList.reduce((sum, item) => sum + item.score, 0) / historyList.length)
          : 0
        
        const latestRecord = historyList.length > 0 
          ? getRelativeTime(historyList[0].time)
          : '暂无'
        
        this.setData({ 
          historyList,
          averageScore,
          latestRecord,
          loading: false
        })
        
        // 同时保存到本地作为备份
        wx.setStorageSync('assessmentHistory', historyList)
        
        console.log('从后端加载评估历史成功，共', historyList.length, '条记录')
      } else {
        console.log('后端返回数据为空，使用本地数据')
        this.loadFromLocal()
      }
    } catch (error) {
      console.error('从后端加载评估历史失败:', error)
      console.log('降级使用本地数据')
      this.loadFromLocal()
    }
  },

  // 从本地加载评估历史
  loadFromLocal() {
    try {
      console.log('从本地加载评估历史...')
      const historyList = wx.getStorageSync('assessmentHistory') || []
      
      // 按时间倒序排列
      historyList.sort((a, b) => new Date(b.time) - new Date(a.time))
      
      // 计算统计数据
      const averageScore = historyList.length > 0 
        ? Math.round(historyList.reduce((sum, item) => sum + item.score, 0) / historyList.length)
        : 0
      
      const latestRecord = historyList.length > 0 
        ? getRelativeTime(historyList[0].time)
        : '暂无'
      
      this.setData({ 
        historyList,
        averageScore,
        latestRecord,
        loading: false
      })
      
      console.log('从本地加载评估历史完成，共', historyList.length, '条记录')
    } catch (e) {
      console.error('加载历史数据失败:', e)
      this.setData({ loading: false })
      app.showToast('加载历史数据失败', 'error')
    }
  },

  // 计算评分（根据风险等级）
  calculateScore(riskLevel) {
    const scoreMap = {
      'low': 90,
      'medium': 70,
      'high': 40,
      'critical': 20
    }
    return scoreMap[riskLevel] || 75
  },

  // 获取风险等级文本
  getRiskLevelText(riskLevel) {
    const textMap = {
      'low': '状态良好',
      'medium': '需要注意',
      'high': '需要处理',
      'critical': '紧急处理'
    }
    return textMap[riskLevel] || '未知'
  },

  // 查看评估详情
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    const record = this.data.historyList.find(item => item.id === id)
    
    if (record) {
      // 跳转到详情页面或显示详情弹窗
      this.showDetailModal(record)
    }
  },

  // 显示详情弹窗
  showDetailModal(record) {
    wx.showModal({
      title: '评估详情',
      content: `评估时间：${formatDateTime(record.time)}\n评分：${record.score}分\n等级：${record.levelText}\n描述：${record.description}`,
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 删除记录
  deleteRecord(e) {
    const { id } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评估记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.confirmDelete(id)
        }
      }
    })
  },

  // 确认删除
  confirmDelete(id) {
    try {
      let historyList = wx.getStorageSync('assessmentHistory') || []
      historyList = historyList.filter(item => item.id !== id)
      
      wx.setStorageSync('assessmentHistory', historyList)
      this.setData({ historyList })
      
      app.showToast('删除成功', 'success')
    } catch (e) {
      console.error('删除记录失败:', e)
      app.showToast('删除失败，请重试', 'error')
    }
  },

  // 清空所有记录
  clearAllRecords() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有评估记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          this.confirmClearAll()
        }
      }
    })
  },

  // 确认清空所有记录
  confirmClearAll() {
    try {
      wx.setStorageSync('assessmentHistory', [])
      this.setData({ historyList: [] })
      
      app.showToast('已清空所有记录', 'success')
    } catch (e) {
      console.error('清空记录失败:', e)
      app.showToast('清空失败，请重试', 'error')
    }
  },

  // 格式化时间 - 使用统一的时间格式化函数
  formatTime(timeStr) {
    return getRelativeTime(timeStr)
  },

  // 分享记录
  shareRecord(e) {
    const { id } = e.currentTarget.dataset
    const record = this.data.historyList.find(item => item.id === id)
    
    if (record) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    }
  },

  // 返回相机页面
  goToCamera() {
    wx.navigateBack()
  },

  // 导出记录
  exportRecords() {
    wx.showModal({
      title: '导出功能',
      content: '导出功能正在开发中，敬请期待',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新')
    this.loadHistoryData()
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('上拉加载更多')
    // 由于数据量不大，这里暂时不需要分页加载
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的造口评估记录',
      path: '/pages/camera/history/history'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '我的造口评估记录'
    }
  }
}) 