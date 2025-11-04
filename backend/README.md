# 造口护理系统后端服务

## 项目简介

这是造口护理系统的后端服务，为患者端和护士端小程序提供完整的RESTful API支持。

## 技术栈

- **Node.js 14+** - JavaScript运行环境
- **Express 4.x** - Web应用框架
- **MySQL 5.7+** - 关系型数据库
- **JWT** - 身份认证和授权
- **Multer** - 文件上传处理
- **Axios** - HTTP客户端
- **Moment.js** - 日期时间处理
- **Bcrypt** - 密码加密

## 核心功能模块

| 模块 | 功能描述 | API端点 |
|------|---------|---------|
| 🔐 用户认证 | 微信登录、JWT token管理 | `/api/auth` |
| 👤 患者管理 | 患者信息CRUD、档案管理 | `/api/patients` |
| 🤖 AI评估 | 图片上传、智能分析、风险评估 | `/api/assessments` |
| 📝 症状日记 | 每日症状记录、数据统计 | `/api/diaries` |
| 📚 护理教育 | 课程管理、学习进度跟踪 | `/api/courses` |
| 📊 健康报告 | 数据分析、趋势预测、建议生成 | `/api/reports` |
| 📋 护理计划 | 个性化护理计划、任务管理 | `/api/care-plans` |
| ⏰ 提醒管理 | 定时提醒、完成记录 | `/api/reminders` |
| 👨‍👩‍👧 家属管理 | 家属信息、紧急联系人 | `/api/families` |

## 快速开始

### 📦 安装

```bash
cd backend
npm install
```

### ⚙️ 配置

1. 复制环境变量配置文件：
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

2. 编辑 `.env` 文件，配置数据库：
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stoma_care_db
```

### 🗄️ 初始化数据库

```bash
npm run init-db
```

### 🚀 启动服务

**开发模式**（推荐，支持热重载）：
```bash
npm run dev
```

**生产模式**：
```bash
npm start
```

### ✅ 验证

访问 http://localhost:3000/api/health 查看服务状态

## 📚 文档

- 📖 [快速启动指南](QUICKSTART.md) - 5分钟快速上手
- 🔧 [安装部署指南](INSTALL.md) - 详细安装和部署说明
- 📡 [API接口文档](API.md) - 完整的API接口说明

## 项目结构

```
backend/
├── src/
│   ├── config/              # 配置文件
│   │   ├── database.js      # 数据库连接配置
│   │   ├── jwt.js           # JWT配置
│   │   ├── upload.js        # 文件上传配置
│   │   └── wechat.js        # 微信API配置
│   ├── controllers/         # 控制器层（处理HTTP请求）
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── assessmentController.js
│   │   ├── diaryController.js
│   │   ├── courseController.js
│   │   ├── reportController.js
│   │   ├── carePlanController.js
│   │   ├── reminderController.js
│   │   └── familyController.js
│   ├── models/              # 数据模型层（数据库操作）
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Assessment.js
│   │   ├── SymptomDiary.js
│   │   ├── Course.js
│   │   ├── LearningRecord.js
│   │   ├── CarePlan.js
│   │   ├── Reminder.js
│   │   └── FamilyMember.js
│   ├── routes/              # 路由定义
│   │   ├── index.js         # 路由入口
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── assessmentRoutes.js
│   │   ├── diaryRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── carePlanRoutes.js
│   │   ├── reminderRoutes.js
│   │   └── familyRoutes.js
│   ├── services/            # 业务逻辑层
│   │   ├── authService.js   # 认证服务
│   │   ├── wechatService.js # 微信API服务
│   │   ├── aiService.js     # AI分析服务
│   │   └── reportService.js # 报告生成服务
│   ├── middlewares/         # 中间件
│   │   ├── auth.js          # JWT认证中间件
│   │   └── errorHandler.js  # 错误处理中间件
│   ├── utils/               # 工具函数
│   │   ├── response.js      # 统一响应格式
│   │   ├── jwt.js           # JWT工具
│   │   ├── validator.js     # 数据验证
│   │   └── date.js          # 日期处理
│   ├── scripts/             # 脚本工具
│   │   └── initDatabase.js  # 数据库初始化脚本
│   └── server.js            # 应用入口文件
├── uploads/                 # 文件上传目录（自动创建）
│   ├── assessments/         # AI评估图片
│   └── avatars/             # 用户头像
├── .env                     # 环境变量配置（需创建）
├── .env.example             # 环境变量示例
├── .gitignore               # Git忽略文件
├── package.json             # 项目配置
├── API.md                   # API文档
├── INSTALL.md               # 安装指南
├── QUICKSTART.md            # 快速开始
├── README.md                # 项目说明
└── test-connection.js       # 数据库连接测试
```

## 🗃️ 数据库设计

系统包含15张数据表：

- `users` - 用户表（微信用户）
- `patients` - 患者信息表
- `nurses` - 护士信息表
- `assessments` - AI评估记录表
- `symptom_diaries` - 症状日记表
- `course_categories` - 课程分类表
- `courses` - 课程表
- `learning_records` - 学习记录表
- `care_plans` - 护理计划表
- `care_plan_items` - 护理计划项目表
- `reminders` - 提醒表
- `reminder_logs` - 提醒记录表
- `family_members` - 家属表

## 🔌 常用命令

```bash
# 安装依赖
npm install

# 开发模式（自动重启）
npm run dev

# 生产模式
npm start

# 初始化数据库
npm run init-db

# 测试数据库连接
npm run test-db
```

## 🔒 安全特性

- JWT Token认证
- 密码bcrypt加密
- SQL注入防护
- XSS攻击防护
- 文件上传类型限制
- 文件大小限制
- CORS跨域控制

## 🚀 部署建议

### 使用PM2部署

```bash
npm install -g pm2
pm2 start src/server.js --name stoma-care-backend
pm2 startup
pm2 save
```

### Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 性能优化

- 数据库连接池（最大10个连接）
- SQL查询优化和索引
- 图片压缩和优化
- 响应数据缓存
- 分页查询支持

## 🐛 调试

开发模式下，所有请求日志会输出到控制台。

查看详细错误信息：
- 检查控制台输出
- 查看返回的error字段
- 使用 `npm run test-db` 测试数据库连接

## 📝 许可证

MIT License

## 👥 贡献

欢迎提交Issue和Pull Request

## 📧 联系方式

如有问题，请查阅文档或提交Issue



