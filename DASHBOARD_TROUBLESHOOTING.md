# 数据大屏故障排查指南

## 🚨 问题：登录后显示"数据加载失败"

### 快速解决方案

#### 1️⃣ 确保后端服务正在运行

```bash
# 进入后端目录
cd backend

# 启动后端服务
npm start
```

**检查输出：**
- ✅ 应该看到：`服务器运行在 http://localhost:3000`
- ✅ 应该看到：`数据库连接成功`
- ❌ 如果报错：检查端口3000是否被占用

#### 2️⃣ 检查配置文件

**开发环境使用：**
```html
<!-- index.html 第9行 -->
<script src="config.dev.js"></script>
```

**config.dev.js 内容：**
```javascript
window.DASHBOARD_CONFIG = {
    apiBaseUrl: 'http://localhost:3000/api',  // 本地开发地址
    refreshInterval: 30000,
    debug: true
};
```

**生产环境使用：**
```html
<!-- index.html 第9行 -->
<script src="config.prod.js"></script>
```

#### 3️⃣ 使用内置测试功能

1. 刷新大屏页面（出现错误页面）
2. 点击 **"测试连接"** 按钮
3. 查看测试结果：
   - ✅ **健康检查成功**: 后端服务正常
   - ✅ **Dashboard API成功**: 数据接口正常
   - ❌ **任一失败**: 查看错误信息

### 详细诊断步骤

#### 步骤1: 检查后端服务

```bash
# Windows PowerShell
Get-Process -Name node

# 或者直接访问健康检查接口
curl http://localhost:3000/api/health
```

**预期返回：**
```json
{
  "success": true,
  "message": "服务运行正常",
  "timestamp": "2025-11-07T..."
}
```

#### 步骤2: 检查数据库

```bash
# 进入数据库
mysql -u root -p

# 检查数据库
USE stoma_care;

# 检查是否有评估数据
SELECT COUNT(*) FROM assessments;
SELECT COUNT(*) FROM patients;
```

**如果表不存在或无数据：**
```bash
# 初始化数据库
cd backend/src/scripts
node initDatabase.js

# 插入测试数据
node insertTestData.js
```

#### 步骤3: 检查Token

**在浏览器控制台（F12）运行：**
```javascript
// 检查token
console.log('Token:', localStorage.getItem('token'));

// 如果没有token，重新登录
// 或手动设置（仅用于测试）
localStorage.setItem('token', 'your-token-here');
location.reload();
```

#### 步骤4: 检查跨域配置

**backend/src/server.js 应该有：**
```javascript
// CORS配置
app.use(cors({
  origin: '*',  // 开发环境
  credentials: true
}));
```

### 常见错误及解决方案

#### ❌ 错误1: "Failed to fetch"
**原因**: 后端服务未启动
**解决**: 
```bash
cd backend
npm start
```

#### ❌ 错误2: "401 Unauthorized"
**原因**: Token无效或过期
**解决**: 返回登录页面重新登录

#### ❌ 错误3: "404 Not Found"
**原因**: API路由不存在
**解决**: 检查 `backend/src/routes/dashboardRoutes.js` 是否存在

#### ❌ 错误4: "CORS Error"
**原因**: 跨域配置错误
**解决**: 检查后端CORS设置

#### ❌ 错误5: "Empty response"
**原因**: 数据库无数据
**解决**: 插入测试数据
```bash
cd backend/src/scripts
node insertTestData.js
```

### 完整启动流程

#### 第一次运行

```bash
# 1. 初始化数据库
cd backend/src/scripts
node initDatabase.js

# 2. 执行DET评分迁移
node migrateToDetScoring.js
# 输入 YES 确认

# 3. 插入测试数据
node insertTestData.js
node insertTestNurse.js

# 4. 启动后端服务
cd ../..
npm start

# 5. 打开浏览器
# http://localhost:3000/login.html
```

#### 日常开发

```bash
# 1. 启动后端
cd backend
npm start

# 2. 访问登录页
http://localhost:3000/login.html

# 3. 使用测试账号登录
账号: test@nurse.com
密码: 123456

# 4. 登录成功后自动跳转到大屏
http://localhost:3000/index.html
```

### 使用浏览器开发工具调试

#### 打开控制台（F12）

**检查网络请求：**
1. 切换到 **Network（网络）** 标签
2. 刷新页面
3. 查找失败的请求（红色）
4. 点击查看详细错误信息

**检查Console错误：**
1. 切换到 **Console（控制台）** 标签
2. 查看红色错误信息
3. 记录错误堆栈

**检查配置：**
```javascript
// 在Console中运行
console.log('配置:', CONFIG);
console.log('Token:', localStorage.getItem('token'));
console.log('API地址:', CONFIG.apiBaseUrl);
```

### 环境切换

#### 开发环境 → 生产环境

```html
<!-- index.html -->
<!-- 修改第9行 -->

<!-- 开发环境 -->
<script src="config.dev.js"></script>

<!-- 改为生产环境 -->
<script src="config.prod.js"></script>
```

#### 生产环境配置

```javascript
// config.prod.js
window.DASHBOARD_CONFIG = {
    apiBaseUrl: 'https://your-domain.com/api',  // 修改为实际域名
    refreshInterval: 30000,
    debug: false
};
```

### 验证系统正常运行

#### ✅ 检查清单

- [ ] 后端服务已启动（port 3000）
- [ ] 数据库连接成功
- [ ] 数据库有测试数据
- [ ] 配置文件正确（dev/prod）
- [ ] 可以正常登录
- [ ] Token正确保存
- [ ] API健康检查通过
- [ ] Dashboard API返回数据

#### 测试命令

```bash
# 1. 测试健康检查
curl http://localhost:3000/api/health

# 2. 测试登录（获取token）
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@nurse.com","password":"123456"}'

# 3. 测试Dashboard API（需要替换YOUR_TOKEN）
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 联系支持

如果以上方法都无法解决问题，请提供：

1. 错误页面截图
2. 浏览器Console错误信息
3. Network请求失败详情
4. 后端服务日志
5. 数据库表结构

---

## 📚 相关文档

- `DASHBOARD_DET_UPDATE.md` - 大屏DET更新说明
- `DET_SYSTEM_GUIDE.md` - DET系统使用指南
- `QUICK_START_DET.md` - 快速开始
- `backend/README.md` - 后端文档

---

**最后更新**: 2025-11-07

