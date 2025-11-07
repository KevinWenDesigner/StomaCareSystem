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
    useBackendData: true, // 是否使用后端数据
    compareMode: false, // 是否处于对比模式
    selectedRecords: [], // 已选中的记录
    selectedIds: [], // 已选中的记录ID（用于模板判断）
    maxCompareCount: 5 // 最多可以对比的记录数
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
      console.log('=== 从后端加载评估历史 ===')
      console.log('请求参数:', { page: this.data.page, pageSize: this.data.pageSize })
      
      const res = await api.getAssessments({
        page: 1,  // 强制使用第1页，确保获取最新数据
        pageSize: 20  // 与 camera.js 保持一致，获取更多记录
      })
      
      console.log('后端响应:', res)
      
      if (res.success && res.data) {
        const backendData = Array.isArray(res.data) ? res.data : []
        console.log('后端返回记录数:', backendData.length)
        console.log('后端数据详情:', backendData.map(item => ({
          id: item.id,
          score: item.score,
          riskLevel: item.riskLevel,
          createdAt: item.createdAt
        })))
        
        const config = require('../../../config.js')
        
        // 转换后端数据格式为前端需要的格式（与 camera.js 保持一致）
        const historyList = backendData.map(item => {
          const imageUrl = item.imageUrl || item.image_url
          // 拼接完整的服务器URL
          const fullImageUrl = imageUrl 
            ? (imageUrl.startsWith('http') 
                ? imageUrl 
                : `${config.apiBaseUrl.replace('/api', '')}${imageUrl}`)
            : ''
          
          // 从后端获取健康指标，如果没有则基于风险等级计算
          const pressureStage = item.pressureStage || item.riskLevel
          const healthMetrics = this.calculateHealthMetricsFromStage(pressureStage)
          
          return {
            id: item.id,
            photoPath: fullImageUrl,  // 使用完整的服务器URL
            imageUrl: imageUrl,  // 保留原始相对路径
            time: formatDateTime(item.createdAt),
            timestamp: new Date(item.createdAt).getTime(),
            score: item.score || 0,  // 直接使用assessments表中的score字段
            level: this.getRiskLevelNumber(item.riskLevel),  // 转换为数字，与camera.js保持一致
            levelText: this.getRiskLevelText(item.riskLevel),
            description: item.stomaColor || item.suggestions || '评估完成',
            stomaColor: item.stomaColor || item.stoma_color,
            stomaSize: item.stomaSize || item.stoma_size,
            skinCondition: item.skinCondition || item.skin_condition,
            analysis: healthMetrics,  // 使用基于NPUAP的健康指标
            rawData: item
          }
        })
        
        // 按时间倒序排列
        historyList.sort((a, b) => new Date(b.time) - new Date(a.time))
        
        console.log('转换后的记录数:', historyList.length)
        console.log('转换后的数据:', historyList.map(item => ({
          id: item.id,
          score: item.score,
          level: item.level,
          levelText: item.levelText,
          time: item.time
        })))
        
        // 计算统计数据
        const averageScore = historyList.length > 0 
          ? Math.round(historyList.reduce((sum, item) => sum + item.score, 0) / historyList.length)
          : 0
        
        const latestRecord = historyList.length > 0 
          ? getRelativeTime(historyList[0].time)
          : '暂无'
        
        console.log('统计数据:', { 总记录数: historyList.length, 平均分: averageScore, 最近记录: latestRecord })
        
        this.setData({ 
          historyList,
          averageScore,
          latestRecord,
          loading: false
        })
        
        // 同时保存到本地作为备份
        wx.setStorageSync('assessmentHistory', historyList)
        
        console.log('✅ 从后端加载评估历史成功')
      } else {
        console.log('⚠️ 后端返回数据为空，使用本地数据')
        this.loadFromLocal()
      }
    } catch (error) {
      console.error('❌ 从后端加载评估历史失败:', error)
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

  // 获取风险等级数字（与 camera.js 保持一致）
  getRiskLevelNumber(riskLevel) {
    const levelMap = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
      // NPUAP 标准
      'normal': 1,
      'stage_1': 2,
      'stage-1': 2,
      'stage_2': 3,
      'stage-2': 3,
      'stage_3': 4,
      'stage-3': 4,
      'stage_4': 4,
      'stage-4': 4,
      'dtpi': 3,
      'unstageable': 4
    }
    return levelMap[riskLevel] || 2
  },

  // 获取风险等级文本（NPUAP 标准）
  getRiskLevelText(riskLevel) {
    const textMap = {
      // 新标准（NPUAP）
      'normal': '正常',
      'stage_1': 'I期压疮',
      'stage-1': 'I期压疮',
      'stage_2': 'II期压疮',
      'stage-2': 'II期压疮',
      'stage_3': 'III期压疮',
      'stage-3': 'III期压疮',
      'stage_4': 'IV期压疮',
      'stage-4': 'IV期压疮',
      'dtpi': '深部组织压伤',
      'unstageable': '不可分期',
      // 旧标准（兼容）
      'low': '状态良好',
      'medium': '需要关注',
      'high': '需要处理',
      'critical': '紧急处理'
    }
    return textMap[riskLevel] || '未知状态'
  },

  // 基于NPUAP分期计算健康指标（与 camera.js 保持一致）
  calculateHealthMetricsFromStage(pressureStage) {
    const metricsMap = {
      'normal': { redness: 0, swelling: 0, infection: 5, healing: 100 },
      'stage_1': { redness: 40, swelling: 20, infection: 20, healing: 75 },
      'stage-1': { redness: 40, swelling: 20, infection: 20, healing: 75 },
      'stage_2': { redness: 60, swelling: 40, infection: 40, healing: 60 },
      'stage-2': { redness: 60, swelling: 40, infection: 40, healing: 60 },
      'stage_3': { redness: 80, swelling: 60, infection: 70, healing: 40 },
      'stage-3': { redness: 80, swelling: 60, infection: 70, healing: 40 },
      'stage_4': { redness: 95, swelling: 80, infection: 90, healing: 20 },
      'stage-4': { redness: 95, swelling: 80, infection: 90, healing: 20 },
      'dtpi': { redness: 70, swelling: 50, infection: 60, healing: 45 },
      'unstageable': { redness: 50, swelling: 50, infection: 85, healing: 15 },
      'invalid': { redness: 0, swelling: 0, infection: 0, healing: 0 },
      // 兼容旧的风险等级
      'low': { redness: 10, swelling: 5, infection: 10, healing: 90 },
      'medium': { redness: 50, swelling: 30, infection: 50, healing: 60 },
      'high': { redness: 80, swelling: 60, infection: 80, healing: 30 },
      'critical': { redness: 95, swelling: 80, infection: 95, healing: 10 }
    }
    return metricsMap[pressureStage] || metricsMap['normal']
  },

  // 切换对比模式
  toggleCompareMode() {
    const compareMode = !this.data.compareMode
    this.setData({
      compareMode,
      selectedRecords: [], // 切换模式时清空选择
      selectedIds: [] // 同时清空ID列表
    })

    if (compareMode) {
      wx.showToast({
        title: '请选择2-5条记录进行对比',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 选择/取消选择记录
  toggleSelectRecord(e) {
    const { id } = e.currentTarget.dataset
    // 确保ID类型一致：将字符串转换为数字（如果后端返回的是数字）
    const numId = Number(id)
    console.log('toggleSelectRecord 被调用, id:', id, 'numId:', numId, 'type:', typeof id)
    console.log('当前 selectedIds:', this.data.selectedIds)

    const record = this.data.historyList.find(item => item.id == id)

    if (!record) {
      console.log('未找到记录, id:', id)
      return
    }

    let selectedRecords = [...this.data.selectedRecords]
    let selectedIds = [...this.data.selectedIds]
    const index = selectedRecords.findIndex(item => item.id == id)

    if (index > -1) {
      // 已选中，取消选择
      console.log('取消选择, index:', index)
      selectedRecords.splice(index, 1)
      selectedIds.splice(index, 1)
    } else {
      // 未选中，添加选择
      if (selectedRecords.length >= this.data.maxCompareCount) {
        wx.showToast({
          title: `最多选择${this.data.maxCompareCount}条记录`,
          icon: 'none'
        })
        return
      }
      console.log('添加选择')
      selectedRecords.push(record)
      // 使用record.id确保类型一致
      selectedIds.push(record.id)
    }

    console.log('更新后 selectedIds:', selectedIds, '类型:', selectedIds.map(id => typeof id))
    this.setData({
      selectedRecords,
      selectedIds
    }, () => {
      console.log('setData 完成, 当前 selectedIds:', this.data.selectedIds)
      console.log('historyList ID类型:', this.data.historyList.map(item => ({id: item.id, type: typeof item.id})))
    })
  },

  // 开始对比
  startCompare() {
    const { selectedRecords } = this.data

    if (selectedRecords.length < 2) {
      wx.showToast({
        title: '请至少选择2条记录进行对比',
        icon: 'none'
      })
      return
    }

    // 将选中的记录保存到全局数据
    getApp().globalData.selectedAssessments = selectedRecords

    // 跳转到对比页面
    wx.navigateTo({
      url: '/pages/camera/compare/compare'
    })
  },

  // 查看评估详情
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    
    // 如果处于对比模式，触发选择逻辑
    if (this.data.compareMode) {
      this.toggleSelectRecord(e)
      return
    }

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