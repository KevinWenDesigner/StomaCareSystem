# 🚀 快速启动指南

## 问题：无法自动登录

您遇到的问题已经解决！现在系统包含完整的登录功能。

## ✅ 解决方案

我已经为您创建了：

1. ✅ **login.html** - 登录页面
2. ✅ **index.html** - 数据大屏（已添加自动跳转和退出功能）
3. ✅ **test-login.html** - 测试页面（用于调试）
4. ✅ **LOGIN_GUIDE.md** - 详细使用文档

## 📖 使用步骤

### 步骤 1：启动后端服务

打开终端（PowerShell 或 CMD），执行：

```bash
cd backend
npm start
```

确保看到类似输出：
```
🚀 造口护理系统后端服务已启动
📍 服务地址: http://localhost:3000
```

### 步骤 2：打开登录页面

**方式 A：直接双击文件**
- 双击打开 `login.html`

**方式 B：使用浏览器打开**
- 在浏览器地址栏输入文件路径，例如：
  ```
  file:///D:/wk/Code/Cursor/2025/StomaCareSystem/login.html
  ```

**方式 C：使用本地服务器（推荐）**
- 使用 VS Code 的 Live Server 插件
- 或者使用 Python：
  ```bash
  python -m http.server 8080
  ```
  然后访问：`http://localhost:8080/login.html`

### 步骤 3：登录系统

#### 快捷登录（推荐）

点击页面上的快捷登录按钮：
- 👨‍⚕️ **护士账号** - 自动填充 `nurse001` / `nurse123`
- 👨‍💼 **管理员** - 自动填充 `admin` / `admin123`

#### 手动输入

**护士账号：**
- 用户名：`nurse001`
- 密码：`nurse123`

**管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

### 步骤 4：查看数据大屏

登录成功后会自动跳转到 `index.html` 数据大屏页面。

### 步骤 5：退出登录（可选）

点击数据大屏右上角的 🚪 **退出登录** 按钮。

## 🧪 测试和调试

如果遇到问题，使用测试页面进行诊断：

1. 打开 `test-login.html`
2. 按顺序执行测试：
   - ✅ 测试后端连接
   - ✅ 测试登录
   - ✅ 测试 Token 验证
   - ✅ 查看登录状态

## 🔧 常见问题排查

### 问题 1：登录时显示"网络错误"

**症状：** 点击登录后提示无法连接后端

**原因：** 后端服务未启动

**解决：**
```bash
cd backend
npm start
```

### 问题 2：登录成功但数据大屏空白

**症状：** 登录后页面空白或显示"未登录"

**原因：** Token 未正确保存

**解决：**
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 输入：`localStorage.getItem('token')`
4. 如果返回 null，重新登录

### 问题 3：CORS 跨域错误

**症状：** 控制台显示 CORS policy 错误

**原因：** 前端访问方式与后端 CORS 配置不匹配

**解决：**
1. 如果使用 `file://` 协议，需要启动本地服务器
2. 或者修改 `backend/src/server.js` 的 CORS 配置：

```javascript
app.use(cors({
    origin: '*',  // 临时允许所有来源（仅用于本地开发）
    credentials: true
}));
```

### 问题 4：数据不刷新

**症状：** 数据大屏显示但不更新

**原因：** 自动刷新可能被禁用

**解决：**
- 按 F5 手动刷新
- 检查 `config.prod.js` 中的 `refreshInterval` 设置

## 📂 项目文件说明

```
StomaCareSystem/
│
├── login.html              # 登录页面（新增）
├── index.html              # 数据大屏（已更新）
├── test-login.html         # 测试页面（新增）
├── config.prod.js          # 配置文件
│
├── LOGIN_GUIDE.md          # 详细使用指南（新增）
├── QUICK_START.md          # 本文件
│
└── backend/
    ├── src/
    │   ├── server.js       # 后端入口（已更新 CORS）
    │   └── controllers/
    │       └── authController.js  # 登录控制器
    └── package.json
```

## 🎯 核心功能说明

### 自动登录流程

```
首次访问 index.html
    ↓
检测 localStorage 中的 token
    ↓
没有 token → 自动跳转到 login.html
    ↓
用户登录获取 token
    ↓
token 保存到 localStorage
    ↓
自动跳转回 index.html
    ↓
以后访问会自动使用保存的 token（自动登录）
```

### 记住登录功能

- ✅ 登录后 token 会保存在浏览器的 localStorage
- ✅ 下次访问会自动使用保存的 token
- ✅ 除非手动退出或清除浏览器数据，否则会一直保持登录状态
- ✅ Token 默认有效期 24 小时（后端配置）

## 🔐 安全提示

⚠️ **重要：这些是测试账号，生产环境请务必修改！**

测试账号配置位置：
- `backend/src/scripts/insertTestNurse.js`
- `backend/src/scripts/insertTestData.js`

修改密码后需要重新初始化数据库：
```bash
cd backend
npm run init-db
npm run insert-test-data
```

## 📱 部署到生产环境

部署到服务器时，需要修改以下配置：

1. **config.prod.js**
   ```javascript
   window.DASHBOARD_CONFIG = {
       apiBaseUrl: 'https://your-domain.com/api',  // 修改为实际 API 地址
       refreshInterval: 30000
   };
   ```

2. **backend/src/server.js**
   ```javascript
   app.use(cors({
       origin: [
           'https://your-domain.com',  // 修改为实际前端域名
       ],
       credentials: true
   }));
   ```

## 💡 下一步

登录成功后，您可以：

1. 📊 查看实时数据大屏
2. 👥 管理患者信息
3. 📈 查看评估趋势
4. ⚠️ 监控高风险患者
5. 📋 处理待审核评估

## 📞 需要帮助？

如果遇到其他问题：

1. 查看 `LOGIN_GUIDE.md` 详细文档
2. 使用 `test-login.html` 进行诊断
3. 检查浏览器控制台（F12）的错误信息
4. 检查后端日志输出

---

**版本：** v1.0  
**创建时间：** 2025-11-06  
**最后更新：** 2025-11-06

