// patient-app/pages/family/family.js
const app = getApp()
const api = require('../../utils/api.js')
import { getCurrentDateTime } from '../../utils/dateFormat.js'

Page({
  data: {
    loading: true,
    useBackendData: true,
    currentTab: 'contacts',
    hasEmergencyContacts: false,
    familyMembers: [
      {
        id: 1,
        name: '张小明',
        relationship: '儿子',
        phone: '138****1234',
        avatar: '👨‍🦱',
        isEmergency: true,
        status: 'active',
        lastContact: '2024-01-20 14:30'
      },
      {
        id: 2,
        name: '李小红',
        relationship: '女儿',
        phone: '139****5678',
        avatar: '👩‍🦰',
        isEmergency: false,
        status: 'active',
        lastContact: '2024-01-19 16:45'
      },
      {
        id: 3,
        name: '王医生',
        relationship: '主治医生',
        phone: '010-12345678',
        avatar: '👨‍⚕️',
        isEmergency: true,
        status: 'active',
        lastContact: '2024-01-18 09:15'
      },
      {
        id: 4,
        name: '刘护士',
        relationship: '护理师',
        phone: '010-87654321',
        avatar: '👩‍⚕️',
        isEmergency: false,
        status: 'active',
        lastContact: '2024-01-17 11:20'
      }
    ],
    relationshipOptions: [
      '配偶', '儿子', '女儿', '父亲', '母亲', '兄弟', '姐妹', '主治医生', '护理师', '其他'
    ],
    showAddModal: false,
    showEditModal: false,
    currentMember: null,
    newMember: {
      name: '',
      relationship: '',
      phone: ''
    }
  },

  onLoad() {
    console.log('家属管理页面加载')
    this.loadFamilyData()
  },

  onShow() {
    console.log('家属管理页面显示')
  },

  // 加载家属数据
  async loadFamilyData() {
    if (this.data.useBackendData) {
      await this.loadFromBackend()
    } else {
      this.loadFromLocal()
    }
  },

  // 从后端加载家属数据
  async loadFromBackend() {
    try {
      const res = await api.getFamilyMembers()
      if (res.success && res.data) {
        const backendMembers = Array.isArray(res.data) ? res.data : []
        const familyMembers = backendMembers.map(member => ({
          id: member.id,
          name: member.name,
          relationship: member.relationship || '其他',
          phone: member.phone,
          avatar: this.getAvatarByRelationship(member.relationship),
          isEmergency: member.isPrimary === 1,
          status: 'active',
          lastContact: member.updatedAt || getCurrentDateTime(),
          rawData: member
        }))
        
        const hasEmergencyContacts = familyMembers.some(member => member.isEmergency)
        
        this.setData({
          familyMembers,
          hasEmergencyContacts,
          loading: false
        })
      }
      console.log('家属数据从后端加载完成')
    } catch (error) {
      console.error('从后端加载家属数据失败:', error)
      this.loadFromLocal()
    }
  },

  // 从本地加载家属数据
  loadFromLocal() {
    try {
      const savedFamilyMembers = wx.getStorageSync('familyMembers') || this.data.familyMembers
      const hasEmergencyContacts = savedFamilyMembers.some(member => member.isEmergency)
      
      this.setData({
        familyMembers: savedFamilyMembers,
        hasEmergencyContacts: hasEmergencyContacts,
        loading: false
      })
      
      console.log('家属数据加载完成')
    } catch (e) {
      console.error('加载家属数据失败:', e)
      app.showToast('数据加载失败', 'none')
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 显示添加家属模态框
  showAddMember() {
    this.setData({
      showAddModal: true,
      newMember: {
        name: '',
        relationship: '',
        phone: '',
        permissions: []
      }
    })
  },

  // 关闭添加家属模态框
  closeAddModal() {
    this.setData({
      showAddModal: false
    })
  },

  // 显示编辑家属模态框
  showEditMember(e) {
    const memberId = e.currentTarget.dataset.id
    const member = this.data.familyMembers.find(m => m.id === memberId)
    
    if (member) {
      this.setData({
        showEditModal: true,
        currentMember: { ...member }
      })
    }
  },

  // 关闭编辑家属模态框
  closeEditModal() {
    this.setData({
      showEditModal: false,
      currentMember: null
    })
  },



  // 输入新家属信息
  inputNewMember(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`newMember.${field}`]: value
    })
  },

  // 输入编辑家属信息
  inputEditMember(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`currentMember.${field}`]: value
    })
  },

  // 选择关系
  selectRelationship(e) {
    const relationship = e.currentTarget.dataset.relationship
    
    if (this.data.showAddModal) {
      this.setData({
        'newMember.relationship': relationship
      })
    } else if (this.data.showEditModal) {
      this.setData({
        'currentMember.relationship': relationship
      })
    }
  },



  // 添加家属
  async addMember() {
    const { newMember, useBackendData } = this.data
    
    if (!newMember.name || !newMember.relationship || !newMember.phone) {
      app.showToast('请填写完整信息', 'error')
      return
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(newMember.phone.replace(/\*/g, '0'))) {
      app.showToast('请输入正确的手机号', 'error')
      return
    }
    
    wx.showLoading({ title: '添加中...' })
    
    try {
      if (useBackendData) {
        // 同步到后端
        const res = await api.createFamilyMember({
          name: newMember.name,
          relationship: newMember.relationship,
          phone: newMember.phone,
          isPrimary: 0
        })
        
        if (res.success && res.data) {
          // 使用后端返回的数据
          const backendMember = {
            id: res.data.id,
            name: res.data.name,
            relationship: res.data.relationship,
            phone: res.data.phone,
            avatar: this.getAvatarByRelationship(res.data.relationship),
            isEmergency: res.data.isPrimary === 1,
            status: 'active',
            lastContact: res.data.updatedAt || getCurrentDateTime(),
            rawData: res.data
          }
          
          const updatedMembers = [backendMember, ...this.data.familyMembers]
          
          this.setData({
            familyMembers: updatedMembers,
            showAddModal: false
          })
          
          // 同时备份到本地
          this.saveFamilyData()
          
          wx.hideLoading()
          app.showToast('家属添加成功', 'success')
          console.log('家属添加成功并同步到后端')
        } else {
          throw new Error('后端返回数据格式错误')
        }
      } else {
        // 仅保存到本地
        this.addMemberLocal()
        wx.hideLoading()
      }
    } catch (error) {
      console.error('添加家属到后端失败:', error)
      wx.hideLoading()
      
      // 询问用户是否仅保存到本地
      wx.showModal({
        title: '网络错误',
        content: '无法同步到服务器，是否仅保存到本地？',
        success: (res) => {
          if (res.confirm) {
            this.addMemberLocal()
          }
        }
      })
    }
  },
  
  // 仅本地添加家属
  addMemberLocal() {
    const { newMember } = this.data
    
    const newMemberData = {
      id: Date.now(),
      ...newMember,
      avatar: this.getAvatarByRelationship(newMember.relationship),
      isEmergency: false,
      status: 'active',
      lastContact: getCurrentDateTime()
    }
    
    const updatedMembers = [newMemberData, ...this.data.familyMembers]
    
    this.setData({
      familyMembers: updatedMembers,
      showAddModal: false
    })
    
    // 保存到本地存储
    this.saveFamilyData()
    
    app.showToast('家属添加成功', 'success')
  },

  // 保存编辑
  async saveEdit() {
    const { currentMember, useBackendData } = this.data
    
    if (!currentMember.name || !currentMember.relationship || !currentMember.phone) {
      app.showToast('请填写完整信息', 'error')
      return
    }
    
    wx.showLoading({ title: '保存中...' })
    
    try {
      if (useBackendData && currentMember.rawData?.id) {
        // 同步到后端
        const res = await api.updateFamilyMember(currentMember.rawData.id, {
          name: currentMember.name,
          relationship: currentMember.relationship,
          phone: currentMember.phone
        })
        
        if (res.success && res.data) {
          // 更新本地数据
          const updatedMembers = this.data.familyMembers.map(member => {
            if (member.id === currentMember.id) {
              return {
                ...currentMember,
                avatar: this.getAvatarByRelationship(currentMember.relationship),
                rawData: res.data
              }
            }
            return member
          })
          
          this.setData({
            familyMembers: updatedMembers,
            showEditModal: false,
            currentMember: null
          })
          
          // 备份到本地
          this.saveFamilyData()
          
          wx.hideLoading()
          app.showToast('家属信息已更新', 'success')
          console.log('家属信息已更新并同步到后端')
        } else {
          throw new Error('后端返回数据格式错误')
        }
      } else {
        // 仅保存到本地
        this.saveEditLocal()
        wx.hideLoading()
      }
    } catch (error) {
      console.error('更新家属信息到后端失败:', error)
      wx.hideLoading()
      
      // 询问用户是否仅保存到本地
      wx.showModal({
        title: '网络错误',
        content: '无法同步到服务器，是否仅保存到本地？',
        success: (res) => {
          if (res.confirm) {
            this.saveEditLocal()
          }
        }
      })
    }
  },
  
  // 仅本地保存编辑
  saveEditLocal() {
    const { currentMember } = this.data
    
    const updatedMembers = this.data.familyMembers.map(member => {
      if (member.id === currentMember.id) {
        return {
          ...currentMember,
          avatar: this.getAvatarByRelationship(currentMember.relationship),
          isEmergency: member.isEmergency
        }
      }
      return member
    })
    
    this.setData({
      familyMembers: updatedMembers,
      showEditModal: false,
      currentMember: null
    })
    
    // 保存到本地存储
    this.saveFamilyData()
    
    app.showToast('家属信息已更新', 'success')
  },

  // 删除家属
  deleteMember(e) {
    const memberId = e.currentTarget.dataset.id
    const member = this.data.familyMembers.find(m => m.id === memberId)
    
    if (!member) {
      app.showToast('家属信息不存在', 'error')
      return
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除家属"${member.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.confirmDeleteMember(memberId, member)
        }
      }
    })
  },
  
  // 确认删除家属
  async confirmDeleteMember(memberId, member) {
    const { useBackendData } = this.data
    
    wx.showLoading({ title: '删除中...' })
    
    try {
      if (useBackendData && member.rawData?.id) {
        // 从后端删除
        const res = await api.deleteFamilyMember(member.rawData.id)
        
        if (res.success) {
          // 删除本地数据
          this.deleteLocalMember(memberId)
          
          wx.hideLoading()
          app.showToast('家属已删除', 'success')
          console.log('家属已删除并同步到后端')
        } else {
          throw new Error('后端删除失败')
        }
      } else {
        // 仅删除本地
        this.deleteLocalMember(memberId)
        wx.hideLoading()
      }
    } catch (error) {
      console.error('从后端删除家属失败:', error)
      wx.hideLoading()
      
      // 询问用户是否仅删除本地
      wx.showModal({
        title: '网络错误',
        content: '无法从服务器删除，是否仅删除本地记录？',
        success: (res) => {
          if (res.confirm) {
            this.deleteLocalMember(memberId)
          }
        }
      })
    }
  },
  
  // 仅本地删除家属
  deleteLocalMember(memberId) {
    const updatedMembers = this.data.familyMembers.filter(m => m.id !== memberId)
    
    this.setData({
      familyMembers: updatedMembers
    })
    
    // 保存到本地存储
    this.saveFamilyData()
    
    app.showToast('家属已删除', 'success')
  },

  // 设置紧急联系人
  async setEmergencyContact(e) {
    const memberId = e.currentTarget.dataset.id
    const member = this.data.familyMembers.find(m => m.id === memberId)
    
    if (!member) {
      app.showToast('家属信息不存在', 'error')
      return
    }
    
    if (member.isEmergency) {
      // 取消紧急联系人
      wx.showModal({
        title: '取消紧急联系人',
        content: `确定要取消"${member.name}"的紧急联系人身份吗？`,
        success: (res) => {
          if (res.confirm) {
            this.toggleEmergencyStatus(memberId, member, false)
          }
        }
      })
    } else {
      // 设置为紧急联系人
      const emergencyCount = this.data.familyMembers.filter(m => m.isEmergency).length
      
      if (emergencyCount >= 3) {
        app.showToast('最多只能设置3个紧急联系人', 'error')
        return
      }
      
      this.toggleEmergencyStatus(memberId, member, true)
    }
  },
  
  // 切换紧急联系人状态
  async toggleEmergencyStatus(memberId, member, isEmergency) {
    const { useBackendData } = this.data
    
    wx.showLoading({ title: isEmergency ? '设置中...' : '取消中...' })
    
    try {
      if (useBackendData && member.rawData?.id) {
        // 同步到后端
        if (isEmergency) {
          // 设置为主要联系人
          const res = await api.setPrimaryContact(member.rawData.id)
          
          if (res.success) {
            this.updateEmergencyStatusLocal(memberId, true)
            wx.hideLoading()
            app.showToast('已设置为紧急联系人', 'success')
            console.log('已设置为紧急联系人并同步到后端')
          } else {
            throw new Error('设置主要联系人失败')
          }
        } else {
          // 取消主要联系人 - 通过更新isPrimary为0
          const res = await api.updateFamilyMember(member.rawData.id, {
            name: member.name,
            relationship: member.relationship,
            phone: member.phone,
            isPrimary: 0
          })
          
          if (res.success) {
            this.updateEmergencyStatusLocal(memberId, false)
            wx.hideLoading()
            app.showToast('已取消紧急联系人', 'success')
            console.log('已取消紧急联系人并同步到后端')
          } else {
            throw new Error('取消主要联系人失败')
          }
        }
      } else {
        // 仅更新本地
        this.updateEmergencyStatusLocal(memberId, isEmergency)
        wx.hideLoading()
      }
    } catch (error) {
      console.error('切换紧急联系人状态失败:', error)
      wx.hideLoading()
      
      // 询问用户是否仅更新本地
      wx.showModal({
        title: '网络错误',
        content: '无法同步到服务器，是否仅更新本地状态？',
        success: (res) => {
          if (res.confirm) {
            this.updateEmergencyStatusLocal(memberId, isEmergency)
          }
        }
      })
    }
  },
  
  // 仅本地更新紧急联系人状态
  updateEmergencyStatusLocal(memberId, isEmergency) {
    const updatedMembers = this.data.familyMembers.map(m => {
      if (m.id === memberId) {
        return { ...m, isEmergency }
      }
      return m
    })
    
    this.setData({
      familyMembers: updatedMembers
    })
    
    this.saveFamilyData()
    app.showToast(isEmergency ? '已设置为紧急联系人' : '已取消紧急联系人', 'success')
  },

  // 联系家属
  contactMember(e) {
    const memberId = e.currentTarget.dataset.id
    const member = this.data.familyMembers.find(m => m.id === memberId)
    
    wx.showModal({
      title: '联系家属',
      content: `是否要联系"${member.name}"？\n电话：${member.phone}`,
      confirmText: '拨打电话',
      success: (res) => {
        if (res.confirm) {
          // 模拟拨打电话
          app.showToast('正在拨打电话...', 'none')
          
          // 更新最后联系时间
          const updatedMembers = this.data.familyMembers.map(m => {
            if (m.id === memberId) {
              return { ...m, lastContact: getCurrentDateTime() }
            }
            return m
          })
          
          this.setData({
            familyMembers: updatedMembers
          })
          
          this.saveFamilyData()
        }
      }
    })
  },

  // 根据关系获取头像
  getAvatarByRelationship(relationship) {
    const avatarMap = {
      '配偶': '👫',
      '儿子': '👨‍🦱',
      '女儿': '👩‍🦰',
      '父亲': '👨‍🦳',
      '母亲': '👩‍🦳',
      '兄弟': '👨‍🦲',
      '姐妹': '👩‍🦱',
      '主治医生': '👨‍⚕️',
      '护理师': '👩‍⚕️',
      '其他': '👤'
    }
    
    return avatarMap[relationship] || '👤'
  },

  // 更新紧急联系人状态
  updateEmergencyContactsStatus() {
    const hasEmergencyContacts = this.data.familyMembers.some(member => member.isEmergency)
    this.setData({
      hasEmergencyContacts: hasEmergencyContacts
    })
  },

  // 保存家属数据
  saveFamilyData() {
    try {
      wx.setStorageSync('familyMembers', this.data.familyMembers)
      // 更新紧急联系人状态
      this.updateEmergencyContactsStatus()
      console.log('家属数据已保存')
    } catch (e) {
      console.error('保存家属数据失败:', e)
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '家属管理 - 造口护理患者端',
      path: '/pages/family/family'
    }
  }
}) 