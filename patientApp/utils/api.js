// utils/api.js - 统一的API服务封装
const config = require('../config.js')

/**
 * 通用的请求方法
 * @param {Object} options 请求选项
 * @returns {Promise}
 */
function request(options) {
  const app = getApp()
  
  return new Promise((resolve, reject) => {
    // 自动拼接API基础地址
    const url = options.url.startsWith('http') 
      ? options.url 
      : `${config.apiBaseUrl}${options.url}`
    
    // 获取token
    const token = wx.getStorageSync('token') || app.globalData.token
    
    wx.request({
      url: url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': options.contentType || 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      timeout: options.timeout || config.timeout,
      success: (res) => {
        console.log(`API请求成功: ${options.method || 'GET'} ${url}`, res)
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          // 成功响应
          if (res.data && res.data.success !== false) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          // token过期或未授权
          console.error('未授权（401），Token可能已过期')
          // 延迟处理，避免立即清除数据
          setTimeout(() => {
            handleUnauthorized()
          }, 500)
          reject({
            success: false,
            message: '登录已过期，请重新登录',
            statusCode: 401
          })
        } else {
          // 其他错误
          console.warn(`API请求返回错误状态: ${res.statusCode}`)
          reject({
            success: false,
            message: res.data.message || '请求失败',
            statusCode: res.statusCode,
            data: res.data
          })
        }
      },
      fail: (err) => {
        console.error(`API请求失败: ${options.method || 'GET'} ${url}`, err)
        
        // 网络错误 - 不清除登录信息，只是提示用户
        // 如果是超时错误
        if (err.errMsg && err.errMsg.indexOf('timeout') !== -1) {
          console.warn('请求超时，但保留登录状态')
        } else {
          console.warn('网络请求失败，但保留登录状态')
        }
        
        // 只在首次失败时显示提示，避免频繁弹窗
        if (!options.silent) {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none',
            duration: 2000
          })
        }
        
        reject({
          success: false,
          message: '网络连接失败，请检查网络',
          statusCode: 0, // 网络错误，状态码为0
          error: err
        })
      }
    })
  })
}

// 防抖：避免短时间内多次触发清除登录
let unauthorizedHandling = false

/**
 * 处理未授权情况
 */
function handleUnauthorized() {
  // 如果正在处理中，避免重复执行
  if (unauthorizedHandling) {
    console.log('已在处理未授权状态，跳过重复执行')
    return
  }
  
  unauthorizedHandling = true
  const app = getApp()
  
  console.log('开始清除登录信息...')
  
  // 清除登录信息
  wx.removeStorageSync('token')
  wx.removeStorageSync('userInfo')
  wx.removeStorageSync('patientInfo')
  
  app.globalData.token = null
  app.globalData.userInfo = null
  
  wx.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  })
  
  // 跳转到首页（登录页）
  setTimeout(() => {
    wx.reLaunch({
      url: '/pages/index/index'
    })
    // 重置标志
    setTimeout(() => {
      unauthorizedHandling = false
    }, 2000)
  }, 1500)
}

/**
 * 上传文件
 * @param {Object} options 上传选项
 * @returns {Promise}
 */
function uploadFile(options) {
  const app = getApp()
  
  return new Promise((resolve, reject) => {
    const url = options.url.startsWith('http') 
      ? options.url 
      : `${config.apiBaseUrl}${options.url}`
    
    const token = wx.getStorageSync('token') || app.globalData.token
    
    wx.uploadFile({
      url: url,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      timeout: options.timeout || 30000,
      success: (res) => {
        console.log(`文件上传成功: ${url}`, res)
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const data = JSON.parse(res.data)
            if (data.success !== false) {
              resolve(data)
            } else {
              reject(data)
            }
          } catch (e) {
            console.error('解析响应数据失败:', e)
            reject({
              success: false,
              message: '数据解析失败'
            })
          }
        } else if (res.statusCode === 401) {
          handleUnauthorized()
          reject({
            success: false,
            message: '登录已过期，请重新登录'
          })
        } else {
          reject({
            success: false,
            message: '上传失败',
            statusCode: res.statusCode
          })
        }
      },
      fail: (err) => {
        console.error(`文件上传失败: ${url}`, err)
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject({
          success: false,
          message: '上传失败',
          error: err
        })
      }
    })
  })
}

// ==================== 认证相关 API ====================

/**
 * 患者微信登录
 * @param {String} code 微信登录code
 * @param {Object} userInfo 用户信息
 */
function loginWithWechat(code, userInfo) {
  return request({
    url: '/auth/login/patient',
    method: 'POST',
    data: {
      code,
      userInfo
    }
  })
}

/**
 * 获取当前用户信息
 */
function getCurrentUser() {
  return request({
    url: '/auth/me',
    method: 'GET'
  })
}

/**
 * 刷新Token
 */
function refreshToken() {
  return request({
    url: '/auth/refresh',
    method: 'POST'
  })
}

// ==================== 患者管理 API ====================

/**
 * 创建患者信息
 * @param {Object} patientData 患者数据
 */
function createPatient(patientData) {
  return request({
    url: '/patients',
    method: 'POST',
    data: patientData
  })
}

/**
 * 获取我的患者信息
 */
function getMyPatient() {
  return request({
    url: '/patients/me',
    method: 'GET'
  })
}

/**
 * 更新患者信息
 * @param {Number} patientId 患者ID
 * @param {Object} patientData 患者数据
 */
function updatePatient(patientId, patientData) {
  return request({
    url: `/patients/${patientId}`,
    method: 'PUT',
    data: patientData
  })
}

// ==================== AI评估 API ====================

/**
 * 上传图片进行AI评估
 * @param {String} imagePath 图片路径
 * @param {Number} patientId 患者ID（可选）
 */
function uploadAssessmentImage(imagePath, patientId) {
  const formData = {}
  if (patientId) {
    formData.patientId = patientId
  }
  
  return uploadFile({
    url: '/assessments',
    filePath: imagePath,
    name: 'image',
    formData: formData
  })
}

/**
 * 获取评估列表
 * @param {Object} params 查询参数
 */
function getAssessments(params = {}) {
  return request({
    url: '/assessments',
    method: 'GET',
    data: params
  })
}

/**
 * 获取最新评估
 */
function getLatestAssessment() {
  return request({
    url: '/assessments/latest',
    method: 'GET'
  })
}

/**
 * 获取评估历史
 * @param {Number} patientId 患者ID
 */
function getAssessmentHistory(patientId) {
  return request({
    url: `/assessments/history/${patientId}`,
    method: 'GET'
  })
}

// ==================== 症状日记 API ====================

/**
 * 创建症状日记
 * @param {Object} diaryData 日记数据
 */
function createDiary(diaryData) {
  return request({
    url: '/diaries',
    method: 'POST',
    data: diaryData
  })
}

/**
 * 获取日记列表
 * @param {Object} params 查询参数
 */
function getDiaries(params = {}) {
  return request({
    url: '/diaries',
    method: 'GET',
    data: params
  })
}

/**
 * 获取日记统计
 * @param {Object} params 查询参数
 */
function getDiaryStats(params = {}) {
  return request({
    url: '/diaries/stats',
    method: 'GET',
    data: params
  })
}

/**
 * 根据日期获取日记
 * @param {Number} patientId 患者ID
 * @param {String} date 日期 (YYYY-MM-DD)
 */
function getDiaryByDate(patientId, date) {
  return request({
    url: `/diaries/${patientId}/${date}`,
    method: 'GET'
  })
}

/**
 * 更新日记
 * @param {Number} diaryId 日记ID
 * @param {Object} diaryData 日记数据
 */
function updateDiary(diaryId, diaryData) {
  return request({
    url: `/diaries/${diaryId}`,
    method: 'PUT',
    data: diaryData
  })
}

// ==================== 护理教育 API ====================

/**
 * 获取课程分类
 */
function getCourseCategories() {
  return request({
    url: '/courses/categories',
    method: 'GET'
  })
}

/**
 * 获取课程列表
 * @param {Object} params 查询参数
 */
function getCourses(params = {}) {
  return request({
    url: '/courses',
    method: 'GET',
    data: params
  })
}

/**
 * 获取课程详情
 * @param {Number} courseId 课程ID
 */
function getCourseDetail(courseId) {
  return request({
    url: `/courses/${courseId}`,
    method: 'GET'
  })
}

/**
 * 记录学习进度
 * @param {Number} courseId 课程ID
 * @param {Object} progressData 进度数据
 */
function recordCourseProgress(courseId, progressData) {
  return request({
    url: `/courses/${courseId}/progress`,
    method: 'POST',
    data: progressData
  })
}

/**
 * 获取我的学习记录
 */
function getMyLearning() {
  return request({
    url: '/courses/my-learning',
    method: 'GET'
  })
}

/**
 * 点赞课程
 * @param {Number} courseId 课程ID
 */
function likeCourse(courseId) {
  return request({
    url: `/courses/${courseId}/like`,
    method: 'POST'
  })
}

// ==================== 健康报告 API ====================

/**
 * 生成健康报告
 * @param {Object} params 查询参数
 */
function generateReport(params = {}) {
  return request({
    url: '/reports/generate',
    method: 'GET',
    data: params
  })
}

/**
 * 获取我的报告
 * @param {Object} params 查询参数
 */
function getMyReport(params = {}) {
  return request({
    url: '/reports/my-report',
    method: 'GET',
    data: params
  })
}

// ==================== 护理计划 API ====================

/**
 * 获取护理计划列表
 * @param {Object} params 查询参数
 */
function getCarePlans(params = {}) {
  return request({
    url: '/care-plans',
    method: 'GET',
    data: params
  })
}

/**
 * 创建护理计划
 * @param {Object} planData 计划数据
 */
function createCarePlan(planData) {
  return request({
    url: '/care-plans',
    method: 'POST',
    data: planData
  })
}

/**
 * 更新计划项目状态
 * @param {Number} planId 计划ID
 * @param {Number} itemId 项目ID
 * @param {Object} itemData 项目数据
 */
function updateCarePlanItem(planId, itemId, itemData) {
  return request({
    url: `/care-plans/${planId}/items/${itemId}`,
    method: 'PUT',
    data: itemData
  })
}

// ==================== 提醒管理 API ====================

/**
 * 获取提醒列表
 */
function getReminders() {
  return request({
    url: '/reminders',
    method: 'GET'
  })
}

/**
 * 获取今日提醒
 */
function getTodayReminders() {
  return request({
    url: '/reminders/today',
    method: 'GET'
  })
}

/**
 * 创建提醒
 * @param {Object} reminderData 提醒数据
 */
function createReminder(reminderData) {
  return request({
    url: '/reminders',
    method: 'POST',
    data: reminderData
  })
}

/**
 * 完成提醒
 * @param {Number} reminderId 提醒ID
 * @param {Object} data 完成数据
 */
function completeReminder(reminderId, data = {}) {
  return request({
    url: `/reminders/${reminderId}/complete`,
    method: 'POST',
    data: data
  })
}

/**
 * 更新提醒
 * @param {Number} reminderId 提醒ID
 * @param {Object} reminderData 提醒数据
 */
function updateReminder(reminderId, reminderData) {
  return request({
    url: `/reminders/${reminderId}`,
    method: 'PUT',
    data: reminderData
  })
}

/**
 * 删除提醒
 * @param {Number} reminderId 提醒ID
 */
function deleteReminder(reminderId) {
  return request({
    url: `/reminders/${reminderId}`,
    method: 'DELETE'
  })
}

// ==================== 家属管理 API ====================

/**
 * 获取家属列表
 */
function getFamilyMembers() {
  return request({
    url: '/families',
    method: 'GET'
  })
}

/**
 * 创建家属
 * @param {Object} familyData 家属数据
 */
function createFamilyMember(familyData) {
  return request({
    url: '/families',
    method: 'POST',
    data: familyData
  })
}

/**
 * 设置主要联系人
 * @param {Number} familyId 家属ID
 */
function setPrimaryContact(familyId) {
  return request({
    url: `/families/${familyId}/primary`,
    method: 'PUT'
  })
}

/**
 * 更新家属信息
 * @param {Number} familyId 家属ID
 * @param {Object} familyData 家属数据
 */
function updateFamilyMember(familyId, familyData) {
  return request({
    url: `/families/${familyId}`,
    method: 'PUT',
    data: familyData
  })
}

/**
 * 删除家属
 * @param {Number} familyId 家属ID
 */
function deleteFamilyMember(familyId) {
  return request({
    url: `/families/${familyId}`,
    method: 'DELETE'
  })
}

// 导出所有API方法
module.exports = {
  // 基础方法
  request,
  uploadFile,
  
  // 认证相关
  loginWithWechat,
  getCurrentUser,
  refreshToken,
  
  // 患者管理
  createPatient,
  getMyPatient,
  updatePatient,
  
  // AI评估
  uploadAssessmentImage,
  getAssessments,
  getLatestAssessment,
  getAssessmentHistory,
  
  // 症状日记
  createDiary,
  getDiaries,
  getDiaryStats,
  getDiaryByDate,
  updateDiary,
  
  // 护理教育
  getCourseCategories,
  getCourses,
  getCourseDetail,
  recordCourseProgress,
  getMyLearning,
  likeCourse,
  
  // 健康报告
  generateReport,
  getMyReport,
  
  // 护理计划
  getCarePlans,
  createCarePlan,
  updateCarePlanItem,
  
  // 提醒管理
  getReminders,
  getTodayReminders,
  createReminder,
  completeReminder,
  updateReminder,
  deleteReminder,
  
  // 家属管理
  getFamilyMembers,
  createFamilyMember,
  setPrimaryContact,
  updateFamilyMember,
  deleteFamilyMember
}


