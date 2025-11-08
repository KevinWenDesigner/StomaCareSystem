# 护理教育模块 - 快速开始指南

## 🚀 5分钟快速上手

本指南帮助您在5分钟内完成护理教育模块的配置和运行。

---

## 第一步：初始化数据库（2分钟）

```bash
# 1. 进入后端目录
cd backend

# 2. 运行数据库初始化脚本
node src/scripts/initDatabase.js
```

**预期输出：**
```
🚀 开始初始化数据库...
✅ 所有数据表创建成功
📝 插入初始数据...
✅ 初始数据插入成功
🎉 数据库初始化完成！
```

---

## 第二步：启动后端服务（1分钟）

```bash
# 确保在 backend 目录下
npm run dev
```

**预期输出：**
```
Server is running on port 3000
Database connected successfully
```

**验证服务器：**
在浏览器中访问 http://localhost:3000/api/health

应该看到：
```json
{
  "success": true,
  "message": "服务运行正常"
}
```

---

## 第三步：配置小程序前端（1分钟）

### 3.1 修改配置文件

打开 `patientApp/config.js`，确认配置：

```javascript
const ENV = 'development';

const environments = {
  development: {
    // 本地调试用 localhost
    apiBaseUrl: 'http://localhost:3000/api',
    
    // 真机调试用你的电脑IP（手机和电脑需在同一WiFi）
    // apiBaseUrl: 'http://192.168.1.100:3000/api',
    
    timeout: 30000,
    enableDebug: true,
  }
};
```

### 3.2 打开微信开发者工具

1. 导入项目，选择 `patientApp` 目录
2. 点击"详情" → 勾选"不校验合法域名"
3. 点击"编译"

---

## 第四步：测试功能（1分钟）

### 4.1 登录
1. 在小程序首页点击"微信快速登录"
2. 确认登录成功

### 4.2 查看课程
1. 点击底部导航栏的"教育"图标
2. 应该看到：
   - ✅ 4个课程分类卡片
   - ✅ 推荐课程列表
   - ✅ 学习统计数据

### 4.3 开始学习
1. 点击任意课程卡片进入详情
2. 点击"开始学习"
3. 完成章节学习

**查看控制台，应该有日志：**
```
调用后端API记录进度: ...
学习进度已同步到后端
```

---

## 🎉 完成！

恭喜！护理教育模块已成功运行。

---

## 📊 快速验证清单

- [ ] ✅ 数据库初始化成功（有5个分类，至少5门课程）
- [ ] ✅ 后端服务正常运行（访问 /api/health 返回成功）
- [ ] ✅ 小程序正常打开（能看到课程列表）
- [ ] ✅ 用户已登录（控制台有Token）
- [ ] ✅ 学习进度能正常保存（控制台有"同步成功"日志）

---

## 🔧 常见问题快速解决

### Q: 课程列表为空
```bash
# 重新初始化数据库
node backend/src/scripts/initDatabase.js
```

### Q: API返回401未授权
```javascript
// 在小程序控制台检查Token
console.log(wx.getStorageSync('token'))
// 如果为空，重新登录
```

### Q: 真机调试连接失败
1. 查看电脑IP地址
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
2. 修改 `patientApp/config.js` 中的 `apiBaseUrl` 为你的IP
3. 确保手机和电脑在同一WiFi

### Q: 学习进度无法保存
1. 检查是否有患者信息
   ```javascript
   console.log(wx.getStorageSync('patientInfo'))
   ```
2. 如果没有，先在个人中心完成患者信息登记

---

## 📚 下一步

- 📖 详细实施指南: [EDUCATION_INTEGRATION_GUIDE.md](./EDUCATION_INTEGRATION_GUIDE.md)
- ✅ 完整检查清单: [EDUCATION_CHECKLIST.md](./EDUCATION_CHECKLIST.md)
- 🧪 API测试: 运行 `node backend/src/scripts/testEducationAPI.js`

---

## 💡 提示

- 开发过程中保持后端服务运行
- 修改代码后需要重新编译小程序
- 查看控制台日志帮助调试问题
- 使用 `enableDebug: true` 查看详细日志

---

**文档版本**: 1.0.0  
**更新日期**: 2025-11-08

