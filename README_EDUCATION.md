# 护理教育模块 - 快速指南

> 🎉 **好消息**: 护理教育模块的前后端代码已全部完成，您只需按照以下步骤配置即可使用！

---

## 📚 完整文档

详细文档请查看 `docs/` 目录：

| 文档 | 适用人群 | 用途 |
|------|---------|------|
| [📖 文档总览](./docs/EDUCATION_README.md) | 所有人 | 了解系统架构和文档导航 |
| [🚀 快速开始](./docs/EDUCATION_QUICK_START.md) | 新手 | 5分钟快速上手 |
| [📋 实施指南](./docs/EDUCATION_INTEGRATION_GUIDE.md) | 开发者 | 完整的实施步骤和API文档 |
| [✅ 检查清单](./docs/EDUCATION_CHECKLIST.md) | 项目经理 | 跟踪实施进度 |

---

## 🚀 三步快速开始

### 步骤1: 初始化数据库
```bash
cd backend
node src/scripts/initDatabase.js
```

### 步骤2: 启动后端服务
```bash
cd backend
npm run dev
```

### 步骤3: 打开小程序
1. 用微信开发者工具打开 `patientApp` 目录
2. 点击"详情" → 勾选"不校验合法域名"
3. 点击底部"教育"标签查看效果

---

## 🧪 测试API

```bash
cd backend
npm run test-education
```

---

## ✅ 已实现的功能

- ✅ 课程分类浏览（基础知识、实践操作、饮食指导、应急处理）
- ✅ 课程列表展示
- ✅ 课程详情查看
- ✅ 开始学习功能
- ✅ 学习进度记录（同步到数据库）
- ✅ 学习统计数据
- ✅ 最近学习记录
- ✅ 课程点赞功能

---

## 📊 系统架构

```
小程序前端 (patientApp)
    ↓ HTTP请求
Node.js后端 (backend)
    ↓ SQL查询
MySQL数据库
```

---

## 🗄️ 数据库表

- `course_categories` - 课程分类表（5个分类）
- `courses` - 课程表（示例课程数据）
- `learning_records` - 学习记录表（用户学习进度）

---

## 📡 API接口

| 接口 | 说明 |
|------|------|
| `GET /api/courses/categories` | 获取课程分类 |
| `GET /api/courses` | 获取课程列表 |
| `GET /api/courses/:id` | 获取课程详情 |
| `POST /api/courses/:id/progress` | 记录学习进度 |
| `GET /api/courses/my-learning` | 获取学习记录 |
| `POST /api/courses/:id/like` | 点赞课程 |

---

## 🔧 配置文件

### 后端配置
- `backend/src/config/database.js` - 数据库连接配置

### 前端配置
- `patientApp/config.js` - API地址配置
  - 本地调试: `http://localhost:3000/api`
  - 真机调试: `http://你的电脑IP:3000/api`

---

## ❓ 常见问题

### Q: 课程列表为空？
**A**: 运行数据库初始化
```bash
node backend/src/scripts/initDatabase.js
```

### Q: API返回401？
**A**: 用户未登录，需要先在小程序中登录

### Q: 真机调试无法连接？
**A**: 
1. 修改 `patientApp/config.js` 中的 `apiBaseUrl` 为你的电脑IP
2. 确保手机和电脑在同一WiFi
3. 在微信开发者工具中勾选"不校验合法域名"

---

## 📝 项目文件说明

### 前端核心文件
```
patientApp/
├── pages/education/
│   ├── education.js          # 教育首页
│   ├── course-detail/        # 课程详情
│   └── course-study/         # 课程学习
├── utils/api.js              # API封装
└── config.js                 # 配置文件
```

### 后端核心文件
```
backend/
├── src/
│   ├── controllers/courseController.js    # 课程控制器
│   ├── models/Course.js                   # 课程模型
│   ├── models/LearningRecord.js           # 学习记录模型
│   ├── routes/courseRoutes.js             # 路由
│   └── scripts/
│       ├── initDatabase.js                # 数据库初始化
│       └── testEducationAPI.js            # API测试
└── package.json
```

---

## 🎓 学习路径

### 对于新手
1. 阅读 [快速开始指南](./docs/EDUCATION_QUICK_START.md)
2. 按照步骤操作
3. 测试功能

### 对于开发者
1. 查看 [文档总览](./docs/EDUCATION_README.md)
2. 阅读 [实施指南](./docs/EDUCATION_INTEGRATION_GUIDE.md)
3. 研究源代码

### 对于项目经理
1. 查看 [完成总结](./EDUCATION_MODULE_SUMMARY.md)
2. 使用 [检查清单](./docs/EDUCATION_CHECKLIST.md)
3. 跟踪实施进度

---

## 📞 获取帮助

- 📖 查看详细文档: `docs/` 目录
- 🧪 运行测试脚本: `npm run test-education`
- 📝 查看完成总结: [EDUCATION_MODULE_SUMMARY.md](./EDUCATION_MODULE_SUMMARY.md)

---

## ✨ 总结

**护理教育模块已完全实现！**

- ✅ 前后端代码完整
- ✅ 数据库脚本就绪
- ✅ API接口完善
- ✅ 文档详尽
- ✅ 测试工具齐全

**您现在只需要按照文档配置和运行即可！**

---

**文档版本**: 1.0.0  
**更新日期**: 2025-11-08

