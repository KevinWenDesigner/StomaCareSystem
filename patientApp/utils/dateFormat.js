// utils/dateFormat.js

/**
 * 格式化日期时间为 "xxxx年xx月xx日 xx:xx:xx" 格式
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的日期时间字符串
 */
function formatDateTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化日期为 "xxxx年xx月xx日" 格式
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}年${month}月${day}日`
}

/**
 * 格式化时间为 "xx:xx:xx" 格式
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return `${hours}:${minutes}:${seconds}`
}

/**
 * 获取相对时间描述（今天、昨天、前天等）
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 相对时间描述
 */
function getRelativeTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const oneDay = 24 * 60 * 60 * 1000
  
  if (diff < oneDay && d.toDateString() === now.toDateString()) {
    return '今天'
  } else if (diff < 2 * oneDay) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) {
      return '昨天'
    }
  } else if (diff < 3 * oneDay) {
    const dayBeforeYesterday = new Date(now)
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
    if (d.toDateString() === dayBeforeYesterday.toDateString()) {
      return '前天'
    }
  }
  
  return formatDate(d)
}

/**
 * 获取当前日期时间
 * @returns {string} 当前日期时间字符串
 */
function getCurrentDateTime() {
  return formatDateTime(new Date())
}

/**
 * 获取当前日期
 * @returns {string} 当前日期字符串
 */
function getCurrentDate() {
  return formatDate(new Date())
}

/**
 * 获取当前时间
 * @returns {string} 当前时间字符串
 */
function getCurrentTime() {
  return formatTime(new Date())
}

module.exports = {
  formatDateTime,
  formatDate,
  formatTime,
  getRelativeTime,
  getCurrentDateTime,
  getCurrentDate,
  getCurrentTime
}

/**
 * 使用示例：
 * 
 * // 导入时间格式化函数
 * import { formatDateTime, getRelativeTime, getCurrentDate } from '../../utils/dateFormat.js'
 * 
 * // 格式化完整日期时间
 * const fullDateTime = formatDateTime(new Date()) // "2024年01月15日 14:30:25"
 * 
 * // 获取相对时间描述
 * const relativeTime = getRelativeTime('2024-01-15 10:30:00') // "今天" 或 "昨天" 或 "2024年01月15日"
 * 
 * // 获取当前日期
 * const today = getCurrentDate() // "2024年01月15日"
 * 
 * // 获取当前完整日期时间
 * const now = getCurrentDateTime() // "2024年01月15日 14:30:25"
 */ 