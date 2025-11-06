# 🏥 造口护理数据大屏

实时展示患者管理数据的可视化大屏系统

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

---

## 📊 功能特点

### 核心功能
- ✅ **实时数据展示** - 自动刷新，无需手动操作
- ✅ **核心指标监控** - 总患者数、活跃患者、评估次数等
- ✅ **风险等级分析** - 高/中/低风险患者分布
- ✅ **趋势分析** - 近7天评估趋势和平均评分
- ✅ **NPUAP分期统计** - 压疮分期分布
- ✅ **造口类型分布** - 不同类型造口患者统计
- ✅ **高风险患者列表** - 重点关注患者实时提醒
- ✅ **待审核提醒** - 待处理评估实时显示

### 设计特点
- 🎨 **现代化UI** - 蓝色科技风格，动态背景效果
- 📱 **响应式设计** - 支持各种屏幕尺寸
- 🔄 **自动刷新** - 30秒自动更新数据
- ⚡ **高性能** - 使用 ECharts 实现流畅的数据可视化
- 🌐 **纯前端** - 无需后端运行时，纯静态页面

---

## 🚀 快速开始

### 在线访问
部署到 GitHub Pages 后，直接访问：
```
https://你的用户名.github.io/stoma-dashboard/
```

### 本地运行
1. 克隆项目：
   ```bash
   git clone https://github.com/你的用户名/stoma-dashboard.git
   cd stoma-dashboard
   ```

2. 使用任意 HTTP 服务器运行：
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (http-server)
   npx http-server -p 8000

   # PHP
   php -S localhost:8000
   ```

3. 访问 `http://localhost:8000`

---

## 📦 部署到 GitHub Pages

### 方法一：自动部署（推荐）

**Windows 用户**：
```bash
双击运行: deploy-to-github-pages.bat
```

**Mac/Linux 用户**：
```bash
chmod +x deploy-to-github-pages.sh
./deploy-to-github-pages.sh
```

### 方法二：手动上传
1. 在 GitHub 创建新仓库
2. 上传以下文件：
   - `index.html`
   - `config.prod.js`
   - `.nojekyll`
3. 在仓库设置中启用 GitHub Pages

详细步骤请查看: [快速指南](./GITHUB_PAGES_快速指南.md)

---

## ⚙️ 配置

### API 地址配置
编辑 `config.prod.js`：

```javascript
window.DASHBOARD_CONFIG = {
    apiBaseUrl: 'https://your-api-domain.com/api',
    refreshInterval: 30000  // 刷新间隔(毫秒)
};
```

### 后端 CORS 配置
后端需要配置 CORS 允许前端访问：

```javascript
app.use(cors({
    origin: 'https://你的用户名.github.io',
    credentials: true
}));
```

---

## 🖥️ 使用场景

### 1. 办公室监控
- 在护士站大屏展示
- 实时监控患者状态
- 快速识别高风险患者

### 2. 远程访问
- 医护人员手机/平板访问
- 随时随地查看数据
- 支持添加到主屏幕

### 3. 会议展示
- 项目汇报数据支撑
- 实时数据演示
- 专业的可视化效果

---

## 📊 数据展示模块

### 左侧栏
- **核心指标**: 总患者数、活跃患者、总评估次数、待审核数
- **今日数据**: 今日评估、今日日记、本周评估、平均评分
- **风险分布**: 饼图展示低/中/高风险患者比例

### 中间栏
- **评估趋势**: 近7天评估次数和平均评分曲线
- **NPUAP分期**: 柱状图展示各期压疮分布

### 右侧栏
- **造口类型**: 饼图展示不同类型造口分布
- **高风险患者**: 列表显示需要重点关注的患者
- **待审核评估**: 列表显示待处理的评估记录

---

## 🔐 安全说明

### Token 认证
- 页面需要 token 才能获取数据
- Token 存储在浏览器 localStorage
- 定期更新 token 提高安全性

### 数据传输
- ✅ 使用 HTTPS 加密传输
- ✅ 前后端分离架构
- ✅ 敏感数据只在后端处理

### 访问控制
- 虽然页面公开，但无 token 无法获取数据
- 后端 API 需要认证
- 建议配合 VPN 或 IP 白名单使用

---

## 🛠️ 技术栈

- **前端框架**: 纯 HTML/CSS/JavaScript
- **图表库**: ECharts 5.4.3
- **样式**: 现代 CSS3（Flexbox、Grid、动画）
- **字体**: Microsoft YaHei, PingFang SC
- **托管**: GitHub Pages

---

## 📁 项目结构

```
stoma-dashboard/
├── index.html                      # 主页面
├── config.prod.js                  # 生产环境配置
├── .nojekyll                       # GitHub Pages 配置
├── README-DASHBOARD.md             # 本文档
├── DEPLOYMENT.md                   # 详细部署指南
├── GITHUB_PAGES_快速指南.md        # 快速部署指南
├── deploy-to-github-pages.bat     # Windows 部署脚本
├── deploy-to-github-pages.sh      # Linux/Mac 部署脚本
└── .gitignore-dashboard            # Git 忽略配置
```

---

## 🔄 更新日志

### v1.0.0 (2025-11-06)
- ✅ 初始版本发布
- ✅ 实现核心数据展示功能
- ✅ 添加自动刷新机制
- ✅ 优化动画和交互效果
- ✅ 完善部署文档

---

## 📞 获取支持

### 文档
- [快速部署指南](./GITHUB_PAGES_快速指南.md)
- [详细部署文档](./DEPLOYMENT.md)

### 问题排查
1. 打开浏览器控制台（F12）
2. 查看 Console 标签的错误信息
3. 查看 Network 标签的网络请求

### 测试后端 API
```bash
# 检查后端是否正常
curl https://stoma.ht-healthcare.com/api/dashboard/stats

# 带 token 测试
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://stoma.ht-healthcare.com/api/dashboard/stats
```

---

## 📄 许可证

MIT License

---

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

## 🌟 特别说明

本项目是 **造口护理智能管理系统** 的数据可视化模块，独立部署以实现：
- ✅ 前后端分离
- ✅ 降低服务器负载
- ✅ 利用 GitHub Pages 免费托管
- ✅ 全球 CDN 加速访问

---

**由 AI 辅助开发 | 专注医疗护理信息化** 🏥

