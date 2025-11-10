// patient-app/pages/camera/compare/compare.js
const app = getApp()
const api = require('../../../utils/api.js')
import { formatDateTime, formatDate } from '../../../utils/dateFormat.js'

Page({
  data: {
    selectedRecords: [],
    comparisonData: null,
    chartData: null,
    showTrendChart: false,
    trendPeriod: '7', // 7天、30天、90天
    activeTab: 'detail', // detail: 详细对比, trend: 趋势分析
  },

  onLoad(options) {
    console.log('评估对比页面加载')
    
    // 从URL参数获取选中的记录ID
    if (options.ids) {
      const ids = options.ids.split(',').map(id => parseInt(id))
      this.loadRecordsForComparison(ids)
    } else {
      // 从全局数据获取选中的记录
      const selectedRecords = getApp().globalData.selectedAssessments || []
      if (selectedRecords.length >= 2) {
        this.setData({ selectedRecords })
        this.prepareComparisonData()
      } else {
        wx.showToast({
          title: '请至少选择2条记录进行对比',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    }
  },

  // 加载记录用于对比
  async loadRecordsForComparison(ids) {
    wx.showLoading({ title: '加载中...' })
    
    try {
      // 从本地缓存获取完整记录
      const allRecords = wx.getStorageSync('assessmentHistory') || []
      const selectedRecords = allRecords.filter(record => 
        ids.includes(record.id)
      )
      
      if (selectedRecords.length >= 2) {
        this.setData({ selectedRecords })
        this.prepareComparisonData()
      } else {
        wx.showToast({
          title: '记录加载失败',
          icon: 'none'
        })
        setTimeout(() => wx.navigateBack(), 1500)
      }
    } catch (error) {
      console.error('加载对比记录失败:', error)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 准备对比数据
  prepareComparisonData() {
    const records = this.data.selectedRecords
    
    // 按时间排序（使用时间戳或原始时间，而不是格式化后的字符串）
    records.sort((a, b) => {
      const timeA = this.getRecordTimestamp(a)
      const timeB = this.getRecordTimestamp(b)
      return timeA - timeB
    })
    
    // 对比记录：当有2条或更多记录时，对比第一条和最后一条
    if (records.length >= 2) {
      const firstRecord = records[0]
      const lastRecord = records[records.length - 1]
      const comparisonData = this.compareTwoRecords(firstRecord, lastRecord)
      this.setData({ comparisonData })
    }
    
    // 准备趋势图表数据
    this.prepareTrendData()
  },

  // 对比两条记录
  compareTwoRecords(record1, record2) {
    const getDifference = (val1, val2) => {
      const diff = val2 - val1
      return {
        value: Math.abs(diff),
        isImproved: diff < 0, // 数值越小越好
        isWorse: diff > 0,
        noChange: diff === 0
      }
    }

    const getAnalysis = record => record.analysis || {
      redness: 0,
      swelling: 0,
      infection: 0,
      healing: 0
    }

    const analysis1 = getAnalysis(record1)
    const analysis2 = getAnalysis(record2)

    // 获取原始时间戳用于格式化
    const timestamp1 = this.getRecordTimestamp(record1)
    const timestamp2 = this.getRecordTimestamp(record2)
    
    return {
      record1: {
        ...record1,
        formattedTime: formatDateTime(new Date(timestamp1)),
        formattedDate: formatDate(new Date(timestamp1))
      },
      record2: {
        ...record2,
        formattedTime: formatDateTime(new Date(timestamp2)),
        formattedDate: formatDate(new Date(timestamp2))
      },
      timeDiff: this.calculateTimeDiff(record1, record2),
      scoreDiff: getDifference(record1.score, 100 - record2.score),
      metrics: {
        redness: {
          before: analysis1.redness,
          after: analysis2.redness,
          diff: getDifference(analysis1.redness, analysis2.redness)
        },
        swelling: {
          before: analysis1.swelling,
          after: analysis2.swelling,
          diff: getDifference(analysis1.swelling, analysis2.swelling)
        },
        infection: {
          before: analysis1.infection,
          after: analysis2.infection,
          diff: getDifference(analysis1.infection, analysis2.infection)
        },
        healing: {
          before: analysis1.healing,
          after: analysis2.healing,
          diff: {
            value: Math.abs(analysis2.healing - analysis1.healing),
            isImproved: analysis2.healing > analysis1.healing, // 愈合度越高越好
            isWorse: analysis2.healing < analysis1.healing,
            noChange: analysis2.healing === analysis1.healing
          }
        }
      },
      overallAssessment: this.getOverallAssessment(analysis1, analysis2)
    }
  },

  // 获取记录的时间戳（优先使用timestamp，其次使用rawData.createdAt，最后解析time字符串）
  getRecordTimestamp(record) {
    // 优先使用 timestamp 字段
    if (record.timestamp && typeof record.timestamp === 'number') {
      return record.timestamp
    }
    
    // 其次使用 rawData.createdAt
    if (record.rawData && record.rawData.createdAt) {
      const date = new Date(record.rawData.createdAt)
      if (!isNaN(date.getTime())) {
        return date.getTime()
      }
    }
    
    // 再次尝试 rawData.assessmentDate
    if (record.rawData && record.rawData.assessmentDate) {
      const date = new Date(record.rawData.assessmentDate)
      if (!isNaN(date.getTime())) {
        return date.getTime()
      }
    }
    
    // 最后尝试解析格式化后的 time 字符串（如 "2025年11月10日 12:18:36"）
    if (record.time && typeof record.time === 'string') {
      // 尝试解析 "xxxx年xx月xx日 xx:xx:xx" 格式
      const match = record.time.match(/(\d+)年(\d+)月(\d+)日\s+(\d+):(\d+):(\d+)/)
      if (match) {
        const year = parseInt(match[1])
        const month = parseInt(match[2]) - 1
        const day = parseInt(match[3])
        const hours = parseInt(match[4])
        const minutes = parseInt(match[5])
        const seconds = parseInt(match[6])
        const date = new Date(year, month, day, hours, minutes, seconds)
        if (!isNaN(date.getTime())) {
          return date.getTime()
        }
      }
      
      // 如果解析失败，尝试直接使用 new Date（可能已经是标准格式）
      const date = new Date(record.time)
      if (!isNaN(date.getTime())) {
        return date.getTime()
      }
    }
    
    // 如果都失败了，返回当前时间戳（作为降级方案）
    console.warn('无法获取记录时间戳，使用当前时间:', record)
    return Date.now()
  },

  // 计算时间差
  calculateTimeDiff(record1, record2) {
    // 获取两个记录的时间戳
    const timestamp1 = this.getRecordTimestamp(record1)
    const timestamp2 = this.getRecordTimestamp(record2)
    
    const diffMs = Math.abs(timestamp2 - timestamp1)
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) {
      return `${diffDays}天${diffHours > 0 ? diffHours + '小时' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours}小时${diffMinutes > 0 ? diffMinutes + '分钟' : ''}`
    } else {
      return `${diffMinutes}分钟`
    }
  },

  // 获取整体评估
  getOverallAssessment(analysis1, analysis2) {
    // 计算总体改善分数（红肿、感染降低，愈合增加为好）
    const improvementScore = 
      (analysis1.redness - analysis2.redness) +
      (analysis1.swelling - analysis2.swelling) +
      (analysis1.infection - analysis2.infection) +
      (analysis2.healing - analysis1.healing)
    
    if (improvementScore > 30) {
      return {
        level: 'great',
        text: '恢复良好',
        color: '#07C160',
        icon: '🎉',
        description: '造口状况明显改善，继续保持良好的护理习惯'
      }
    } else if (improvementScore > 0) {
      return {
        level: 'good',
        text: '稳步恢复',
        color: '#10AEFF',
        icon: '👍',
        description: '造口状况有所改善，建议继续当前护理方案'
      }
    } else if (improvementScore === 0) {
      return {
        level: 'stable',
        text: '状态稳定',
        color: '#FFC107',
        icon: '😐',
        description: '造口状况保持稳定，请继续观察并保持护理'
      }
    } else if (improvementScore > -30) {
      return {
        level: 'attention',
        text: '需要关注',
        color: '#FF9500',
        icon: '⚠️',
        description: '造口状况略有下降，建议调整护理方案或咨询护士'
      }
    } else {
      return {
        level: 'warning',
        text: '需要处理',
        color: '#FA5151',
        icon: '⚠️',
        description: '造口状况下降明显，请尽快联系护士进行评估'
      }
    }
  },

  // 准备趋势数据
  prepareTrendData() {
    const records = this.data.selectedRecords
    
    // 按时间排序（使用时间戳）
    const sortedRecords = [...records].sort((a, b) => {
      const timeA = this.getRecordTimestamp(a)
      const timeB = this.getRecordTimestamp(b)
      return timeA - timeB
    })
    
    // 准备图表数据
    const chartData = {
      categories: sortedRecords.map(r => {
        const timestamp = this.getRecordTimestamp(r)
        return formatDate(new Date(timestamp))
      }),
      series: [
        {
          name: '健康评分',
          data: sortedRecords.map(r => r.score),
          color: '#10AEFF'
        },
        {
          name: '红肿程度',
          data: sortedRecords.map(r => {
            const analysis = r.analysis || { redness: 0 }
            return 100 - analysis.redness
          }),
          color: '#FA5151'
        },
        {
          name: '感染风险',
          data: sortedRecords.map(r => {
            const analysis = r.analysis || { infection: 0 }
            return 100 - analysis.infection
          }),
          color: '#FF9500'
        },
        {
          name: '愈合程度',
          data: sortedRecords.map(r => {
            const analysis = r.analysis || { healing: 0 }
            return analysis.healing
          }),
          color: '#07C160'
        }
      ]
    }
    
    this.setData({ chartData })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  // 查看详细记录
  viewRecordDetail(e) {
    const index = e.currentTarget.dataset.index
    const record = this.data.selectedRecords[index]
    
    if (record) {
      wx.showModal({
        title: '评估详情',
        content: `评估时间：${formatDateTime(record.time)}\n评分：${record.score} 分\n等级：${record.levelText}\n造口颜色：${record.stomaColor || '未记录'}\n造口大小：${record.stomaSize || '未记录'}\n皮肤状况：${record.skinCondition || '未记录'}`,
        showCancel: false,
        confirmText: '确定'
      })
    }
  },

  // 查看图片对比
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const record = this.data.selectedRecords[index]
    
    if (record && record.photoPath) {
      const urls = this.data.selectedRecords
        .filter(r => r.photoPath)
        .map(r => r.photoPath)
      
      wx.previewImage({
        urls: urls,
        current: record.photoPath
      })
    }
  },

  // 切换趋势周期
  changeTrendPeriod(e) {
    const period = e.currentTarget.dataset.period
    this.setData({ trendPeriod: period })
    this.loadTrendData(period)
  },

  // 加载趋势数据
  async loadTrendData(days) {
    wx.showLoading({ title: '加载趋势数据...' })
    
    try {
      // 获取指定天数内的所有评估记录
      const allRecords = wx.getStorageSync('assessmentHistory') || []
      const now = new Date()
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      
      const trendRecords = allRecords.filter(record => {
        // 使用时间戳进行比较
        const recordTimestamp = this.getRecordTimestamp(record)
        const recordDate = new Date(recordTimestamp)
        return recordDate >= startDate && recordDate <= now
      })
      
      if (trendRecords.length > 0) {
        this.setData({ 
          selectedRecords: trendRecords,
          showTrendChart: true
        })
        this.prepareTrendData()
      } else {
        wx.showToast({
          title: '该时段暂无数据',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载趋势数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 生成对比报告
  generateReport() {
    wx.showLoading({ title: '生成报告中...' })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '功能提示',
        content: '报告生成功能正在开发中，敬请期待。\n\n未来将支持：\n- PDF格式导出\n- 分享给医护人员\n- 打印功能',
        showCancel: false,
        confirmText: '我知道了'
      })
    }, 1000)
  },

  // 分享对比结果
  shareComparison() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  // 返回历史记录页面
  goBack() {
    // 清除全局选中状态
    if (getApp().globalData.selectedAssessments) {
      getApp().globalData.selectedAssessments = []
    }
    wx.navigateBack()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的造口评估对比',
      path: '/pages/camera/compare/compare'
    }
  }
})

