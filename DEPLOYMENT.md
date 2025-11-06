# 数据大屏部署指南 - GitHub Pages

## 📋 简介

本指南介绍如何将数据大屏部署到 GitHub Pages，实现免费的在线访问。

**已配置的API地址**: `https://stoma.ht-healthcare.com/api`

---

## 📦 文件清单

```
StomaCareSystem/
├── index.html           # 数据大屏主页面
├── config.prod.js       # 生产环境配置（API地址已配置）
├── .nojekyll           # 禁用 Jekyll 处理
└── DEPLOYMENT.md       # 本文档
```

---

## 🚀 部署步骤

### 方式一：通过 GitHub 网页操作（推荐新手）

#### 1. 创建 GitHub 仓库
1. 登录 GitHub
2. 点击右上角 `+` → `New repository`
3. 填写仓库信息：
   - Repository name: `stoma-dashboard`（或其他名称）
   - Description: `造口护理数据大屏`
   - 选择 `Public`（必须是公开仓库才能使用免费 Pages）
   - 点击 `Create repository`

#### 2. 上传文件
1. 在新建的仓库页面，点击 `uploading an existing file`
2. 上传以下文件：
   - `index.html`
   - `config.prod.js`
   - `.nojekyll`（如果没有，下一步会创建）
3. 点击 `Commit changes`

#### 3. 启用 GitHub Pages
1. 进入仓库的 `Settings` → `Pages`
2. 在 **Source** 下：
   - Branch: 选择 `main`（或 `master`）
   - Folder: 选择 `/root`
3. 点击 `Save`
4. 等待几分钟后，页面会显示访问地址，如：
   ```
   Your site is published at https://yourusername.github.io/stoma-dashboard/
   ```

---

### 方式二：通过 Git 命令行操作

#### 1. 初始化并推送到 GitHub

```bash
# 如果还没有初始化 git 仓库
cd D:\wk\Code\Cursor\2025\StomaCareSystem
git init

# 创建 .gitignore（排除不需要的文件）
cat > .gitignore << EOF
node_modules/
backend/
nurseApp/
patientApp/
PD/
uploads/
*.log
EOF

# 添加文件
git add index.html
git add config.prod.js
git add .nojekyll

# 提交
git commit -m "部署数据大屏到 GitHub Pages"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/yourusername/stoma-dashboard.git

# 推送到 GitHub
git push -u origin main
```

#### 2. 启用 GitHub Pages
按照方式一的步骤 3 启用 Pages。

---

### 方式三：使用 GitHub Actions 自动部署（高级）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          publish_branch: gh-pages
```

然后在仓库设置中，将 Pages 的 Branch 改为 `gh-pages`。

---

## 🔧 重要配置说明

### 1. API 地址配置

`config.prod.js` 已配置：
```javascript
window.DASHBOARD_CONFIG = {
    apiBaseUrl: 'https://stoma.ht-healthcare.com/api',
    refreshInterval: 30000  // 30秒刷新一次
};
```

如需修改，直接编辑 `config.prod.js` 文件。

### 2. .nojekyll 文件

此文件用于禁用 GitHub 的 Jekyll 处理，确保所有文件都能正常访问。

如果项目中没有此文件，创建一个空文件：
```bash
# Windows
type nul > .nojekyll

# Linux/Mac
touch .nojekyll
```

### 3. 自定义域名（可选）

如果你有自己的域名：

1. 在仓库根目录创建 `CNAME` 文件，内容为你的域名：
   ```
   dashboard.yourdomain.com
   ```

2. 在域名 DNS 设置中添加 CNAME 记录：
   ```
   CNAME  dashboard  yourusername.github.io
   ```

3. 在 GitHub Pages 设置中填写自定义域名

---

## ✅ 后端 CORS 配置

由于前端部署在 GitHub Pages，后端需要配置 CORS 允许跨域访问。

### Node.js (Express) 后端配置

在 `backend/src/server.js` 中添加：

```javascript
const cors = require('cors');

// 允许 GitHub Pages 域名访问
app.use(cors({
    origin: [
        'https://yourusername.github.io',
        'https://dashboard.yourdomain.com',  // 如果配置了自定义域名
        'http://localhost:3000'  // 本地开发
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 检查清单
- ✅ `Access-Control-Allow-Origin` 包含 GitHub Pages 域名
- ✅ `Access-Control-Allow-Credentials` 设置为 true
- ✅ `Access-Control-Allow-Headers` 包含 `Authorization`

---

## 🔍 验证部署

部署成功后，访问你的 GitHub Pages 地址，检查：

1. ✅ 页面正常显示
2. ✅ 打开浏览器控制台（F12），检查：
   - 无 JavaScript 错误
   - API 请求成功（Network 标签）
   - 数据正常加载
3. ✅ 图表正常渲染
4. ✅ 数据自动刷新

---

## 🐛 常见问题

### 问题 1: 页面显示 404
**原因**: GitHub Pages 未正确配置

**解决方法**:
1. 确认仓库是公开的（Public）
2. 检查 Settings → Pages 是否已启用
3. 确认分支和目录选择正确
4. 等待几分钟让 GitHub 构建完成

### 问题 2: API 请求失败（CORS 错误）
**错误信息**: `Access to fetch at 'https://...' from origin 'https://yourusername.github.io' has been blocked by CORS policy`

**解决方法**:
1. 在后端配置 CORS，允许 GitHub Pages 域名
2. 确认后端服务正常运行
3. 使用浏览器控制台查看具体错误信息

### 问题 3: 数据不显示
**可能原因**:
- Token 未登录
- API 地址错误
- 后端服务未启动

**解决方法**:
1. 先访问登录页面获取 token
2. 检查 `config.prod.js` 中的 API 地址
3. 在浏览器控制台查看错误信息：
   ```javascript
   // 打开控制台，检查配置
   console.log(CONFIG);
   
   // 检查 token
   console.log(localStorage.getItem('token'));
   ```

### 问题 4: 文件更新不生效
**原因**: 浏览器缓存

**解决方法**:
1. 强制刷新页面（Ctrl + F5 或 Cmd + Shift + R）
2. 清除浏览器缓存
3. 使用隐私模式/无痕模式测试

---

## 📱 访问方式

### 桌面浏览器
直接访问 GitHub Pages 地址即可

### 移动设备
1. 用手机浏览器访问 GitHub Pages 地址
2. 建议添加到主屏幕，类似原生应用体验

### 大屏展示
1. 使用大屏电视或投影仪
2. 设置浏览器全屏模式（F11）
3. 数据会自动刷新，无需人工操作

---

## 🔐 安全建议

### 1. Token 管理
- ⚠️ Token 存储在浏览器 localStorage 中
- ⚠️ 定期更换 token
- ⚠️ 不同设备需要分别登录

### 2. 访问控制
GitHub Pages 是公开的，任何人都可以访问页面，但：
- ✅ 没有 token 无法获取数据
- ✅ 后端 API 需要认证
- ✅ 敏感数据只在后端处理

### 3. HTTPS
- ✅ GitHub Pages 默认支持 HTTPS
- ✅ 确保后端 API 也使用 HTTPS
- ✅ 避免混合内容（HTTPS 页面调用 HTTP API）

---

## 📊 更新部署

当需要更新页面时：

### 方式 1: 通过 GitHub 网页
1. 进入仓库
2. 点击要修改的文件
3. 点击 ✏️ 编辑按钮
4. 修改后点击 `Commit changes`
5. 等待几分钟生效

### 方式 2: 通过 Git 命令
```bash
# 修改文件后
git add .
git commit -m "更新数据大屏"
git push

# 等待几分钟生效
```

---

## 🎯 部署清单

部署前检查：
- [ ] `config.prod.js` 中的 API 地址正确
- [ ] 创建了 `.nojekyll` 文件
- [ ] 后端服务正常运行
- [ ] 后端 CORS 已配置
- [ ] 后端使用 HTTPS（与 GitHub Pages 匹配）

部署后验证：
- [ ] 页面可以访问
- [ ] 登录功能正常
- [ ] 数据可以加载
- [ ] 图表正常显示
- [ ] 自动刷新正常工作

---

## 📞 获取帮助

如果遇到问题：

1. **查看浏览器控制台**（F12）
   - Console 标签：查看 JavaScript 错误
   - Network 标签：查看 API 请求

2. **检查 GitHub Pages 构建日志**
   - 进入仓库 Actions 标签
   - 查看最近的构建记录

3. **测试后端 API**
   ```bash
   # 使用 curl 测试
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://stoma.ht-healthcare.com/api/dashboard/stats
   ```

---

## 🌟 完成！

现在你的数据大屏已经部署到 GitHub Pages，可以通过网络访问了！

**访问地址**: `https://yourusername.github.io/stoma-dashboard/`

**特点**:
- ✅ 免费托管
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 无需服务器维护
- ✅ 随时更新部署

---

**祝部署顺利！** 🚀
