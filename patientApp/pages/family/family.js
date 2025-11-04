// patient-app/pages/family/family.js
const app = getApp()
import { getCurrentDateTime } from '../../utils/dateFormat.js'

Page({
  data: {
    loading: true,
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
  loadFamilyData() {
    try {
      // 从本地存储加载数据
      const savedFamilyMembers = wx.getStorageSync('familyMembers') || this.data.familyMembers
      
      // 计算是否有紧急联系人
      const hasEmergencyContacts = savedFamilyMembers.some(member => member.isEmergency)
      
      this.setData({
        familyMembers: savedFamilyMembers,
        hasEmergencyContacts: hasEmergencyContacts,
        loading: false
      })
      
      console.log('家属数据加载完成')
    } catch (e) {
      console.error('加载家属数据失败:', e)
      app.showToast('数据加载失败', 'error')
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
  addMember() {
    const { newMember } = this.data
    
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
  saveEdit() {
    const { currentMember } = this.data
    
    if (!currentMember.name || !currentMember.relationship || !currentMember.phone) {
      app.showToast('请填写完整信息', 'error')
      return
    }
    
    const updatedMembers = this.data.familyMembers.map(member => {
      if (member.id === currentMember.id) {
        return {
          ...currentMember,
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
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除家属"${member.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const updatedMembers = this.data.familyMembers.filter(m => m.id !== memberId)
          
          this.setData({
            familyMembers: updatedMembers
          })
          
          // 保存到本地存储
          this.saveFamilyData()
          
          app.showToast('家属已删除', 'success')
        }
      }
    })
  },

  // 设置紧急联系人
  setEmergencyContact(e) {
    const memberId = e.currentTarget.dataset.id
    const member = this.data.familyMembers.find(m => m.id === memberId)
    
    if (member.isEmergency) {
      // 取消紧急联系人
      wx.showModal({
        title: '取消紧急联系人',
        content: `确定要取消"${member.name}"的紧急联系人身份吗？`,
        success: (res) => {
          if (res.confirm) {
            const updatedMembers = this.data.familyMembers.map(m => {
              if (m.id === memberId) {
                return { ...m, isEmergency: false }
              }
              return m
            })
            
            this.setData({
              familyMembers: updatedMembers
            })
            
            this.saveFamilyData()
            app.showToast('已取消紧急联系人', 'success')
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
      
      const updatedMembers = this.data.familyMembers.map(m => {
        if (m.id === memberId) {
          return { ...m, isEmergency: true }
        }
        return m
      })
      
      this.setData({
        familyMembers: updatedMembers
      })
      
      this.saveFamilyData()
      app.showToast('已设置为紧急联系人', 'success')
    }
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