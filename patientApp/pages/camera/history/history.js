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
    maxCompareCount: 5, // 最多可以对比的记录数
    chartWidth: 0, // 图表宽度
    chartHeight: 400, // 图表高度
    chartRendering: false // 图表是否正在渲染（防止重复渲染）
  },

  onLoad() {
    console.log('历史评估记录页面加载')
    this.loadHistoryData()
  },

  onShow() {
    console.log('历史评估记录页面显示')
    this.loadHistoryData()
  },

  onReady() {
    // 页面渲染完成后，如果已有数据则绘制图表
    // 注意：这里不直接绘制，因为 loadHistoryData 会在数据加载后自动绘制
    // 如果数据已经存在，延迟绘制以确保 Canvas 已渲染
    if (this.data.historyList && this.data.historyList.length > 0) {
      setTimeout(() => {
        if (!this.data.chartRendering) {
          this.drawTrendChart()
        }
      }, 500)
    }
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
          // 修復：開發環境使用 HTTP，但生產環境應使用 HTTPS
          let fullImageUrl = ''
          if (imageUrl) {
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              fullImageUrl = imageUrl
            } else {
              // 相對路徑，拼接服務器地址
              const baseUrl = config.apiBaseUrl.replace('/api', '')
              fullImageUrl = `${baseUrl}${imageUrl}`
              // 注意：開發環境使用 HTTP 是正常的，但微信小程序可能會警告
              // 生產環境應該使用 HTTPS
            }
          } else {
            // 如果没有图片URL，使用占位图
            fullImageUrl = '/images/camera.png'
          }
          
          // 从后端获取健康指标，如果没有则基于风险等级计算
          const riskLevel = item.detLevel || item.riskLevel || 'moderate'
          const healthMetrics = this.calculateHealthMetricsFromStage(riskLevel)
          
          // 確保時間戳正確計算
          const createdAt = item.createdAt || item.assessmentDate || item.created_at || item.assessment_date
          const timestamp = createdAt ? new Date(createdAt).getTime() : Date.now()
          
          return {
            id: item.id,
            photoPath: fullImageUrl,  // 使用完整的服务器URL
            imageUrl: imageUrl,  // 保留原始相对路径
            time: formatDateTime(createdAt),
            timestamp: timestamp,  // 確保時間戳存在
            score: item.score || 0,  // 直接使用assessments表中的score字段
            level: this.getRiskLevelNumber(item.riskLevel || item.detLevel),  // 转换为数字，与camera.js保持一致
            levelText: this.getRiskLevelText(item.riskLevel || item.detLevel),
            description: item.stomaColor || item.suggestions || '评估完成',
            stomaColor: item.stomaColor || item.stoma_color,
            stomaSize: item.stomaSize || item.stoma_size,
            skinCondition: item.skinCondition || item.skin_condition,
            analysis: healthMetrics,  // 使用基于DET评分的健康指标
            rawData: item  // 保留完整的原始數據，包括 detScore
          }
        })
        
        // 按时间倒序排列（使用時間戳，更可靠）
        historyList.sort((a, b) => {
          const timeA = a.timestamp || (a.rawData && a.rawData.createdAt ? new Date(a.rawData.createdAt).getTime() : 0)
          const timeB = b.timestamp || (b.rawData && b.rawData.createdAt ? new Date(b.rawData.createdAt).getTime() : 0)
          return timeB - timeA  // 倒序：最新的在前
        })
        
        console.log('转换后的记录数:', historyList.length)
        console.log('转换后的数据:', historyList.map(item => ({
          id: item.id,
          score: item.score,
          level: item.level,
          levelText: item.levelText,
          time: item.time,
          rawData: item.rawData ? {
            detScore: item.rawData.detScore,
            det_d_total: item.rawData.det_d_total,
            det_e_total: item.rawData.det_e_total,
            det_t_total: item.rawData.det_t_total,
            det_total: item.rawData.det_total,
            score: item.rawData.score
          } : null
        })))
        
        // 詳細檢查第一條記錄的 rawData
        if (historyList.length > 0) {
          console.log('第一條記錄的完整 rawData:', JSON.stringify(historyList[0].rawData, null, 2))
        }
        
        // 计算统计数据
        const averageScore = historyList.length > 0 
          ? Math.round(historyList.reduce((sum, item) => sum + item.score, 0) / historyList.length)
          : 0
        
        // 修復：使用原始時間戳或 createdAt 來計算相對時間，而不是格式化後的時間字符串
        let latestRecord = '暂无'
        if (historyList.length > 0) {
          const latestItem = historyList[0]
          // 優先使用 timestamp，其次使用 rawData.createdAt，最後使用 time
          if (latestItem.timestamp) {
            latestRecord = getRelativeTime(new Date(latestItem.timestamp))
          } else if (latestItem.rawData && latestItem.rawData.createdAt) {
            latestRecord = getRelativeTime(latestItem.rawData.createdAt)
          } else if (latestItem.rawData && latestItem.rawData.assessmentDate) {
            latestRecord = getRelativeTime(latestItem.rawData.assessmentDate)
          } else {
            // 如果都沒有，嘗試從格式化時間字符串中解析（作為最後手段）
            try {
              // 嘗試解析 "2025年11月10日 12:18:36" 格式
              const timeStr = latestItem.time
              if (timeStr && timeStr.includes('年')) {
                const match = timeStr.match(/(\d+)年(\d+)月(\d+)日/)
                if (match) {
                  const year = parseInt(match[1])
                  const month = parseInt(match[2]) - 1
                  const day = parseInt(match[3])
                  const date = new Date(year, month, day)
                  latestRecord = getRelativeTime(date)
                }
              }
            } catch (e) {
              console.warn('無法解析最近記錄時間:', e)
              latestRecord = historyList[0].time || '暂无'
            }
          }
          // 確保 latestRecord 不為空
          if (!latestRecord || latestRecord === '') {
            latestRecord = '今天'
          }
        }
        
        console.log('统计数据:', { 总记录数: historyList.length, 平均分: averageScore, 最近记录: latestRecord })
        
        this.setData({ 
          historyList,
          averageScore,
          latestRecord,
          loading: false
        })
        
        // 同时保存到本地作为备份
        wx.setStorageSync('assessmentHistory', historyList)
        
        // 绘制趋势图表（延迟执行，确保页面已渲染）
        setTimeout(() => {
          this.drawTrendChart()
        }, 300)
        
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
      
      // 按时间倒序排列（使用時間戳，與後端數據加載保持一致）
      historyList.sort((a, b) => {
        const timeA = a.timestamp || (a.rawData && a.rawData.createdAt ? new Date(a.rawData.createdAt).getTime() : 0)
        const timeB = b.timestamp || (b.rawData && b.rawData.createdAt ? new Date(b.rawData.createdAt).getTime() : 0)
        return timeB - timeA  // 倒序：最新的在前
      })
      
      // 计算统计数据
      const averageScore = historyList.length > 0 
        ? Math.round(historyList.reduce((sum, item) => sum + item.score, 0) / historyList.length)
        : 0
      
      // 修復：使用時間戳計算相對時間
      let latestRecord = '暂无'
      if (historyList.length > 0) {
        const latestItem = historyList[0]
        if (latestItem.timestamp) {
          latestRecord = getRelativeTime(new Date(latestItem.timestamp))
        } else if (latestItem.rawData && latestItem.rawData.createdAt) {
          latestRecord = getRelativeTime(latestItem.rawData.createdAt)
        } else if (latestItem.rawData && latestItem.rawData.assessmentDate) {
          latestRecord = getRelativeTime(latestItem.rawData.assessmentDate)
        } else {
          latestRecord = latestItem.time || '暂无'
        }
        // 確保 latestRecord 不為空
        if (!latestRecord || latestRecord === '') {
          latestRecord = '今天'
        }
      }
      
      this.setData({ 
        historyList,
        averageScore,
        latestRecord,
        loading: false
      })
      
      // 绘制趋势图表（延迟执行，确保页面已渲染）
      setTimeout(() => {
        this.drawTrendChart()
      }, 300)
      
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
      // DET 等级（新标准）
      'excellent': 1,  // 优秀（无皮炎）
      'good': 2,       // 良好（轻度皮炎）
      'moderate': 3,   // 中度（中度皮炎）
      'poor': 4,       // 较差（重度皮炎）
      'critical': 5,   // 严重（极重度皮炎）
      // 旧标准（兼容）
      'low': 1,
      'medium': 2,
      'high': 3,
      'normal': 1
    }
    return levelMap[riskLevel] || 2
  },

  // 获取风险等级文本（DET 标准）
  getRiskLevelText(riskLevel) {
    const textMap = {
      // DET 等级（新标准）
      'excellent': '优秀（无皮炎）',
      'good': '良好（轻度皮炎）',
      'moderate': '中度（中度皮炎）',
      'poor': '较差（重度皮炎）',
      'critical': '严重（极重度皮炎）',
      // 旧标准（兼容）
      'low': '状态良好',
      'medium': '需要关注',
      'high': '需要处理',
      'normal': '正常'
    }
    return textMap[riskLevel] || '未知状态'
  },

  // 基于DET评分计算健康指标（与 camera.js 保持一致）
  calculateHealthMetricsFromStage(riskLevel) {
    const metricsMap = {
      // DET 等级（新标准）
      'excellent': { redness: 0, swelling: 0, infection: 5, healing: 100 },    // 优秀（无皮炎）
      'good': { redness: 20, swelling: 10, infection: 15, healing: 85 },       // 良好（轻度皮炎）
      'moderate': { redness: 50, swelling: 35, infection: 45, healing: 55 },   // 中度（中度皮炎）
      'poor': { redness: 80, swelling: 65, infection: 75, healing: 25 },       // 较差（重度皮炎）
      'critical': { redness: 95, swelling: 85, infection: 95, healing: 5 },    // 严重（极重度皮炎）
      'invalid': { redness: 0, swelling: 0, infection: 0, healing: 0 },
      // 兼容旧的风险等级
      'low': { redness: 10, swelling: 5, infection: 10, healing: 90 },
      'medium': { redness: 50, swelling: 30, infection: 50, healing: 60 },
      'high': { redness: 80, swelling: 60, infection: 80, healing: 30 },
      'normal': { redness: 0, swelling: 0, infection: 5, healing: 100 }  // 默认正常状态
    }
    return metricsMap[riskLevel] || metricsMap['normal']
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
    console.log('toggleSelectRecord 被调用, id:', id, 'type:', typeof id)
    console.log('当前 selectedIds:', this.data.selectedIds)

    // 使用宽松比较查找记录，支持数字和字符串
    const record = this.data.historyList.find(item => String(item.id) === String(id) || item.id == id)

    if (!record) {
      console.log('未找到记录, id:', id)
      return
    }

    let selectedRecords = [...this.data.selectedRecords]
    let selectedIds = [...this.data.selectedIds]
    // 统一转换为字符串进行比较，确保类型一致
    const recordIdStr = String(record.id)
    const index = selectedIds.findIndex(selectedId => String(selectedId) === recordIdStr)

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
      // 统一保存为字符串，确保类型一致
      selectedIds.push(String(record.id))
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

    // 使用宽松比较查找记录，支持数字和字符串
    const record = this.data.historyList.find(item => String(item.id) === String(id) || item.id == id)

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
  async confirmDelete(id) {
    try {
      // 确保 ID 是数字类型（后端可能需要数字 ID）
      const assessmentId = Number(id)
      console.log('开始删除评估记录, ID:', id, '转换后:', assessmentId)
      
      if (!assessmentId || isNaN(assessmentId)) {
        console.error('无效的评估ID:', id)
        app.showToast('无效的评估ID', 'error')
        return
      }
      
      // 调用后端API删除记录
      if (this.data.useBackendData) {
        try {
          console.log('调用后端删除API, assessmentId:', assessmentId)
          const res = await api.deleteAssessment(assessmentId)
          console.log('后端删除响应:', res)
          
          if (res && res.success !== false) {
            // 删除成功，刷新列表
            console.log('✅ 后端删除成功')
            app.showToast(res.message || '删除成功', 'success')
            
            // 重新加载数据（会自动重新绘制图表）
            this.setData({ chartRendering: false }) // 重置渲染标志
            await this.loadHistoryData()
          } else {
            console.error('❌ 后端删除失败:', res?.message || '未知错误')
            app.showToast(res?.message || '删除失败，请重试', 'error')
          }
        } catch (error) {
          console.error('❌ 调用后端删除API失败:', error)
          console.error('错误详情:', error.message, error.statusCode)
          
          // 显示具体错误信息
          const errorMessage = error.message || '网络连接失败，请检查网络'
          app.showToast(errorMessage, 'error')
          
          // 如果后端删除失败，尝试从本地删除（降级处理）
          console.log('降级处理：从本地删除记录')
          this.deleteFromLocal(id)
        }
      } else {
        // 如果使用本地数据，直接从本地删除
        this.deleteFromLocal(id)
      }
    } catch (e) {
      console.error('删除记录失败:', e)
      app.showToast('删除失败，请重试', 'error')
    }
  },

  // 从本地删除记录（降级处理）
  deleteFromLocal(id) {
    try {
      let historyList = wx.getStorageSync('assessmentHistory') || []
      // 使用宽松比较，支持数字和字符串
      historyList = historyList.filter(item => String(item.id) !== String(id) && item.id != id)
      
      wx.setStorageSync('assessmentHistory', historyList)
      this.setData({ historyList })
      
      app.showToast('删除成功', 'success')
    } catch (e) {
      console.error('从本地删除记录失败:', e)
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
    // 使用宽松比较查找记录，支持数字和字符串
    const record = this.data.historyList.find(item => String(item.id) === String(id) || item.id == id)
    
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

  // 图片加载错误处理
  onImageError(e) {
    const itemId = e.currentTarget.dataset.id
    console.warn('图片加载失败，评估ID:', itemId)
    
    // 可以在这里更新列表，移除或标记失败的图片
    // 使用宽松比较，支持数字和字符串
    const historyList = this.data.historyList.map(item => {
      if (String(item.id) === String(itemId) || item.id == itemId) {
        return {
          ...item,
          imageError: true,
          photoPath: '/images/camera.png' // 使用相机图标作为占位图
        }
      }
      return item
    })
    
    this.setData({ historyList })
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
  },

  // 绘制趋势图表
  drawTrendChart() {
    // 防止重复渲染
    if (this.data.chartRendering) {
      console.log('图表正在渲染中，跳过重复调用')
      return
    }
    
    const historyList = this.data.historyList
    
    if (!historyList || historyList.length === 0) {
      console.log('没有数据，跳过图表绘制')
      return
    }

    // 设置渲染标志
    this.setData({ chartRendering: true })

    // 准备图表数据
    const chartData = this.prepareChartData(historyList)
    
    // 延迟执行，确保 Canvas 已渲染
    setTimeout(() => {
      // 使用 Canvas 2D API
      const query = wx.createSelectorQuery().in(this)
      query.select('#trendChart')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          
          if (!canvas || !ctx) {
            console.error('无法获取 Canvas 2D 上下文')
            this.setData({ chartRendering: false })
            return
          }
          
          // 获取系统信息，计算像素比
          let pixelRatio = 2
          try {
            const deviceInfo = wx.getDeviceInfo()
            pixelRatio = deviceInfo.pixelRatio || 2
          } catch (e) {
            const systemInfo = wx.getSystemInfoSync()
            pixelRatio = systemInfo.pixelRatio || 2
          }
          
          // 获取 Canvas 显示尺寸（rpx 转 px）
          const dpr = pixelRatio
          const width = res[0].width
          const height = res[0].height
          
          // 设置 Canvas 实际绘制尺寸（考虑像素比）
          canvas.width = width * dpr
          canvas.height = height * dpr
          
          // 缩放上下文以适应高 DPI 屏幕
          ctx.scale(dpr, dpr)
          
          console.log('Canvas 2D 尺寸:', { 
            顯示尺寸: { width, height },
            繪制尺寸: { width: canvas.width, height: canvas.height },
            像素比: dpr
          })
          
          // 渲染图表（使用显示尺寸，因为已经缩放）
          try {
            this.renderChart2D(ctx, chartData, width, height, 1)
            this.setData({ chartRendering: false })
          } catch (error) {
            console.error('图表渲染失败:', error)
            this.setData({ chartRendering: false })
          }
        })
    }, 500) // 延迟时间，确保 Canvas 完全渲染
  },

  // 准备图表数据
  prepareChartData(historyList) {
    // 按时间正序排列（最早的在前面）- 使用時間戳排序
    const sortedList = [...historyList].sort((a, b) => {
      const timeA = a.timestamp || (a.rawData && a.rawData.createdAt ? new Date(a.rawData.createdAt).getTime() : 0)
      const timeB = b.timestamp || (b.rawData && b.rawData.createdAt ? new Date(b.rawData.createdAt).getTime() : 0)
      return timeA - timeB  // 正序：最早的在前
    })
    
    console.log('準備圖表數據，記錄數:', sortedList.length)
    console.log('排序後的記錄:', sortedList.map(item => ({
      id: item.id,
      timestamp: item.timestamp,
      time: item.time,
      score: item.score,
      rawData: item.rawData ? {
        detScore: item.rawData.detScore,
        det_d_total: item.rawData.det_d_total,
        det_e_total: item.rawData.det_e_total,
        det_t_total: item.rawData.det_t_total,
        det_total: item.rawData.det_total
      } : null
    })))

    const dates = []
    const dScores = []
    const eScores = []
    const tScores = []
    const totalScores = []

    sortedList.forEach((item, index) => {
      // 获取 detScore，優先從多個來源獲取
      let detScore = null
      
      // 1. 優先從 rawData.detScore 獲取（後端 formatAssessment 構建的對象）
      if (item.rawData && item.rawData.detScore) {
        detScore = item.rawData.detScore
        console.log(`記錄 ${item.id} [${index}]: 從 rawData.detScore 獲取`, detScore)
      }
      // 2. 從 rawData 的獨立字段獲取（後端數據庫字段）
      else if (item.rawData) {
        // 後端 formatAssessment 會構建 detScore，但如果沒有，從原始字段獲取
        const dTotal = item.rawData.det_d_total !== undefined && item.rawData.det_d_total !== null 
          ? item.rawData.det_d_total 
          : (item.rawData.detDTotal !== undefined && item.rawData.detDTotal !== null ? item.rawData.detDTotal : 0)
        const eTotal = item.rawData.det_e_total !== undefined && item.rawData.det_e_total !== null 
          ? item.rawData.det_e_total 
          : (item.rawData.detETotal !== undefined && item.rawData.detETotal !== null ? item.rawData.detETotal : 0)
        const tTotal = item.rawData.det_t_total !== undefined && item.rawData.det_t_total !== null 
          ? item.rawData.det_t_total 
          : (item.rawData.detTTotal !== undefined && item.rawData.detTTotal !== null ? item.rawData.detTTotal : 0)
        const total = item.rawData.det_total !== undefined && item.rawData.det_total !== null 
          ? item.rawData.det_total 
          : (item.rawData.detTotal !== undefined && item.rawData.detTotal !== null ? item.rawData.detTotal : (item.rawData.score || 0))
        
        detScore = {
          d_total: dTotal,
          e_total: eTotal,
          t_total: tTotal,
          total: total
        }
        console.log(`記錄 ${item.id} [${index}]: 從獨立字段構建 detScore`, detScore)
      }
      // 3. 如果都沒有，嘗試從 item 本身獲取（後端可能直接在頂層）
      else if (item.detScore) {
        detScore = item.detScore
        console.log(`記錄 ${item.id} [${index}]: 從 item.detScore 獲取`, detScore)
      }
      // 4. 最後，使用 score 作為總分，其他為0
      else {
        detScore = {
          d_total: 0,
          e_total: 0,
          t_total: 0,
          total: item.score || 0
        }
        console.log(`記錄 ${item.id} [${index}]: 使用默認值`, detScore)
      }
      
      // 获取日期（只显示月-日）
      let date
      if (item.timestamp) {
        date = new Date(item.timestamp)
      } else if (item.rawData && item.rawData.createdAt) {
        date = new Date(item.rawData.createdAt)
      } else if (item.rawData && item.rawData.assessmentDate) {
        date = new Date(item.rawData.assessmentDate)
      } else if (item.rawData && item.rawData.created_at) {
        date = new Date(item.rawData.created_at)
      } else {
        date = new Date()
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('无效的日期:', item.timestamp || item.time, item.rawData)
        date = new Date()
      }
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      dates.push(`${month}/${day}`)

      // 获取 D/E/T 分数和总分（確保有值）
      const dTotal = detScore.d_total !== undefined && detScore.d_total !== null 
        ? Number(detScore.d_total) 
        : (detScore.dTotal !== undefined && detScore.dTotal !== null ? Number(detScore.dTotal) : 0)
      const eTotal = detScore.e_total !== undefined && detScore.e_total !== null 
        ? Number(detScore.e_total) 
        : (detScore.eTotal !== undefined && detScore.eTotal !== null ? Number(detScore.eTotal) : 0)
      const tTotal = detScore.t_total !== undefined && detScore.t_total !== null 
        ? Number(detScore.t_total) 
        : (detScore.tTotal !== undefined && detScore.tTotal !== null ? Number(detScore.tTotal) : 0)
      const total = detScore.total !== undefined && detScore.total !== null 
        ? Number(detScore.total) 
        : (item.score !== undefined && item.score !== null ? Number(item.score) : 0)
      
      console.log(`記錄 ${item.id} [${index}] 最終DET評分:`, { dTotal, eTotal, tTotal, total, date: `${month}/${day}` })
      
      dScores.push(dTotal)
      eScores.push(eTotal)
      tScores.push(tTotal)
      totalScores.push(total)
    })

    // 计算最大分数
    const allScores = [...totalScores, ...dScores, ...eScores, ...tScores].filter(s => !isNaN(s) && s >= 0)
    const maxScore = allScores.length > 0 
      ? Math.max(15, Math.max(...allScores) + 2) // 加2以便留出上边距
      : 15

    console.log('圖表數據準備完成:', {
      數據點數: dates.length,
      日期範圍: dates.length > 0 ? `${dates[0]} - ${dates[dates.length - 1]}` : '無',
      D分數範圍: dScores.length > 0 ? `${Math.min(...dScores)} - ${Math.max(...dScores)}` : '無',
      E分數範圍: eScores.length > 0 ? `${Math.min(...eScores)} - ${Math.max(...eScores)}` : '無',
      T分數範圍: tScores.length > 0 ? `${Math.min(...tScores)} - ${Math.max(...tScores)}` : '無',
      總分範圍: totalScores.length > 0 ? `${Math.min(...totalScores)} - ${Math.max(...totalScores)}` : '無',
      最大分數: maxScore
    })

    return {
      dates,
      dScores,
      eScores,
      tScores,
      totalScores,
      maxScore
    }
  },

  // 使用 Canvas 2D API 渲染图表
  renderChart2D(ctx, chartData, width, height, pixelRatio = 1) {
    console.log('開始渲染圖表 (Canvas 2D):', { width, height, pixelRatio, chartData })
    
    // 图表区域设置
    const padding = {
      top: 40,
      right: 40,
      bottom: 60,
      left: 50
    }
    
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    console.log('圖表區域:', { chartWidth, chartHeight, padding, width, height })

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    const { dates, dScores, eScores, tScores, totalScores, maxScore } = chartData
    const dataCount = dates.length

    console.log('圖表數據:', { dataCount, dates, dScores, eScores, tScores, totalScores, maxScore })

    if (dataCount === 0) {
      // 没有数据，显示提示
      ctx.fillStyle = '#999999'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('暂无数据', width / 2, height / 2)
      console.log('圖表繪制完成（無數據）')
      return
    }

    // 计算坐标
    const xStep = dataCount > 1 ? chartWidth / (dataCount - 1) : 0
    const yMax = Math.max(5, Math.ceil(maxScore * 1.2))

    console.log('坐標計算:', { xStep, yMax, dataCount, chartWidth, chartHeight })

    // 绘制坐标轴
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 2
    
    // X轴
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top + chartHeight)
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.stroke()

    // Y轴
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.stroke()

    // 绘制网格线
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    // 绘制Y轴标签
    ctx.fillStyle = '#666666'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= gridLines; i++) {
      const value = yMax - (yMax / gridLines) * i
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.fillText(Math.round(value).toString(), padding.left - 10, y)
    }

    // 绘制X轴标签
    ctx.fillStyle = '#666666'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    const maxLabels = Math.min(8, dataCount)
    const labelStep = dataCount > maxLabels ? Math.ceil(dataCount / maxLabels) : 1
    
    dates.forEach((date, index) => {
      if (dataCount <= maxLabels || index % labelStep === 0 || index === 0 || index === dataCount - 1) {
        let x
        if (dataCount === 1) {
          x = padding.left + chartWidth / 2
        } else {
          x = padding.left + xStep * index
        }
        ctx.fillText(date, x, padding.top + chartHeight + 30)
      }
    })

    // 绘制数据点函数
    const drawLine = (scores, color, lineWidth = 3, label = '') => {
      if (dataCount === 0 || !scores || scores.length === 0) {
        console.warn(`跳過繪制 ${label}，數據為空`)
        return
      }

      console.log(`繪制 ${label} 線條，數據點數:`, scores.length, '分數:', scores)

      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // 繪制線條
      if (dataCount === 1) {
        // 單個數據點
        const score = scores[0] || 0
        const x = padding.left + chartWidth / 2
        const y = padding.top + chartHeight - (score / yMax) * chartHeight
        
        console.log(`${label} 單點座標:`, { x, y, score, yMax, chartHeight })
        
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.fill()
      } else {
        // 多個數據點，繪制線條
        ctx.beginPath()
        const points = []
        scores.forEach((score, index) => {
          const x = padding.left + xStep * index
          const y = padding.top + chartHeight - (score / yMax) * chartHeight
          points.push({ x, y, score, index })
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
        console.log(`${label} 線條點座標 (前3個和後3個):`, {
          前3個: points.slice(0, 3),
          後3個: points.slice(-3),
          總數: points.length
        })

        // 绘制数据点
        ctx.fillStyle = color
        scores.forEach((score, index) => {
          const x = padding.left + xStep * index
          const y = padding.top + chartHeight - (score / yMax) * chartHeight
          
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fill()
        })
      }
    }

    // 绘制四条曲线
    drawLine(dScores, '#ff6b6b', 3, 'D (变色)')
    drawLine(eScores, '#4ecdc4', 3, 'E (侵蚀)')
    drawLine(tScores, '#ffe66d', 3, 'T (组织增生)')
    drawLine(totalScores, '#667eea', 3, '总分')

    // 标题已在 WXML 中显示，此处不再绘制，避免重复

    console.log('✅ 圖表繪制完成 (Canvas 2D)')
  },
  
  // 使用旧版 Canvas API 渲染图表（降级方案）
  renderChart(chartData, width, height, pixelRatio = 2) {
    console.log('開始渲染圖表 (舊版API):', { width, height, pixelRatio, chartData })
    
    // 使用 canvas-id 创建上下文
    let ctx
    try {
      ctx = wx.createCanvasContext('trendChart', this)
      if (!ctx) {
        throw new Error('无法创建 Canvas 上下文')
      }
    } catch (error) {
      console.error('创建 Canvas 上下文失败:', error)
      this.setData({ chartRendering: false })
      return
    }
    
    // 图表区域设置（使用像素值）
    // 注意：width 和 height 已经是乘以 pixelRatio 后的绘制尺寸
    const padding = {
      top: 40 * pixelRatio,
      right: 40 * pixelRatio,
      bottom: 60 * pixelRatio,
      left: 50 * pixelRatio
    }
    
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    
    // 确保尺寸有效
    if (chartWidth <= 0 || chartHeight <= 0) {
      console.error('无效的图表尺寸:', { chartWidth, chartHeight, width, height, padding })
      this.setData({ chartRendering: false })
      return
    }

    console.log('圖表區域:', { chartWidth, chartHeight, padding })

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制背景
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, width, height)

    const { dates, dScores, eScores, tScores, totalScores, maxScore } = chartData
    const dataCount = dates.length

    console.log('圖表數據:', { dataCount, dates, dScores, eScores, tScores, totalScores, maxScore })

    if (dataCount === 0) {
      ctx.setFillStyle('#999999')
      ctx.setFontSize(28 * pixelRatio)
      ctx.setTextAlign('center')
      ctx.fillText('暂无数据', width / 2, height / 2)
      ctx.draw(false, () => {
        console.log('圖表繪制完成（無數據）')
        this.setData({ chartRendering: false })
      })
      return
    }

    // 计算坐标 - 关键修复：确保 xStep 正确计算
    // chartWidth 是减去 padding 后的实际绘图区域宽度
    let xStep = 0
    if (dataCount > 1) {
      xStep = chartWidth / (dataCount - 1)
    } else if (dataCount === 1) {
      xStep = 0 // 单点时不需要步进
    }
    
    const yMax = Math.max(5, Math.ceil(maxScore * 1.2))

    console.log('坐標計算:', { 
      xStep, 
      yMax, 
      dataCount, 
      chartWidth, 
      chartHeight,
      padding,
      width,
      height,
      pixelRatio,
      第一個點x: dataCount > 0 ? padding.left : 0,
      最後一個點x: dataCount > 1 ? padding.left + xStep * (dataCount - 1) : padding.left + chartWidth / 2
    })

    // 绘制坐标轴
    ctx.setStrokeStyle('#e0e0e0')
    ctx.setLineWidth(2 * pixelRatio)
    
    // X轴
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top + chartHeight)
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.stroke()

    // Y轴
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.stroke()

    // 绘制网格线
    ctx.setStrokeStyle('#f0f0f0')
    ctx.setLineWidth(1 * pixelRatio)
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    // 绘制Y轴标签
    ctx.setFillStyle('#666666')
    ctx.setFontSize(14 * pixelRatio)
    ctx.setTextAlign('right')
    for (let i = 0; i <= gridLines; i++) {
      const value = yMax - (yMax / gridLines) * i
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.fillText(Math.round(value).toString(), padding.left - 10 * pixelRatio, y + 6 * pixelRatio)
    }

    // 绘制X轴标签
    ctx.setFillStyle('#666666')
    ctx.setFontSize(14 * pixelRatio)
    ctx.setTextAlign('center')
    
    const maxLabels = Math.min(8, dataCount)
    const labelStep = dataCount > maxLabels ? Math.ceil(dataCount / maxLabels) : 1
    
    dates.forEach((date, index) => {
      if (dataCount <= maxLabels || index % labelStep === 0 || index === 0 || index === dataCount - 1) {
        let x
        if (dataCount === 1) {
          x = padding.left + chartWidth / 2
        } else {
          x = padding.left + xStep * index
        }
        ctx.fillText(date, x, padding.top + chartHeight + 30 * pixelRatio)
      }
    })

    // 绘制数据点函数
    const drawLine = (scores, color, lineWidth = 3, label = '') => {
      if (dataCount === 0 || !scores || scores.length === 0) {
        console.warn(`跳過繪制 ${label}，數據為空`)
        return
      }

      console.log(`繪制 ${label} 線條，數據點數:`, scores.length, '分數:', scores)

      ctx.setStrokeStyle(color)
      ctx.setLineWidth(lineWidth * pixelRatio)
      ctx.setLineCap('round')
      ctx.setLineJoin('round')

      if (dataCount === 1) {
        // 單個數據點
        const score = scores[0] || 0
        const x = padding.left + chartWidth / 2
        const y = padding.top + chartHeight - (score / yMax) * chartHeight
        
        console.log(`${label} 單點座標:`, { x, y, score, yMax, chartHeight, chartWidth })
        
        ctx.beginPath()
        ctx.arc(x, y, 6 * pixelRatio, 0, 2 * Math.PI)
        ctx.setFillStyle(color)
        ctx.fill()
      } else {
        // 多個數據點，繪制線條
        const points = []
        ctx.beginPath()
        
        scores.forEach((score, index) => {
          // 关键修复：确保 x 坐标正确计算
          const x = padding.left + (xStep * index)
          const y = padding.top + chartHeight - ((score / yMax) * chartHeight)
          
          // 确保坐标在有效范围内
          if (x < padding.left || x > padding.left + chartWidth) {
            console.warn(`${label} 點 ${index} x坐標超出範圍:`, { x, paddingLeft: padding.left, chartWidth, xStep, index })
          }
          if (y < padding.top || y > padding.top + chartHeight) {
            console.warn(`${label} 點 ${index} y坐標超出範圍:`, { y, paddingTop: padding.top, chartHeight, score, yMax })
          }
          
          points.push({ x, y, score, index })
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
        
        // 只输出前3个和后3个点的坐标，避免日志过多
        if (points.length > 6) {
          console.log(`${label} 線條點座標:`, {
            前3個: points.slice(0, 3),
            後3個: points.slice(-3),
            總數: points.length,
            xStep,
            chartWidth,
            paddingLeft: padding.left
          })
        } else {
          console.log(`${label} 線條點座標:`, points)
        }

        // 绘制数据点
        ctx.setFillStyle(color)
        scores.forEach((score, index) => {
          const x = padding.left + (xStep * index)
          const y = padding.top + chartHeight - ((score / yMax) * chartHeight)
          
          ctx.beginPath()
          ctx.arc(x, y, 4 * pixelRatio, 0, 2 * Math.PI)
          ctx.fill()
        })
      }
    }

    // 绘制四条曲线
    drawLine(dScores, '#ff6b6b', 3, 'D (变色)')
    drawLine(eScores, '#4ecdc4', 3, 'E (侵蚀)')
    drawLine(tScores, '#ffe66d', 3, 'T (组织增生)')
    drawLine(totalScores, '#667eea', 3, '总分')

    // 标题已在 WXML 中显示，此处不再绘制，避免重复

    // 执行绘制
    ctx.draw(false, () => {
      console.log('✅ 圖表繪制完成 (舊版API)')
      // 重置渲染标志
      this.setData({ chartRendering: false })
    })
  }
}) 