# 护理教育模块文档

## 📚 文档导航

本目录包含护理教育模块的完整文档，帮助您快速实现前后端数据库交互。

---

## 🎯 快速导航

### 对于初学者 → [快速开始指南](./EDUCATION_QUICK_START.md)
**适合人群**: 想要快速上手，5分钟内完成配置和运行

**内容概览**:
- ⚡ 4个简单步骤
- 🎯 快速验证清单
- 🔧 常见问题快速解决

---

### 对于实施人员 → [完整实施指南](./EDUCATION_INTEGRATION_GUIDE.md)
**适合人群**: 需要详细了解系统架构和完整实施流程

**内容概览**:
- 📐 系统架构概览
- 🔄 完整数据流程图
- 📡 API接口详细说明
- 🧪 测试验证方法
- ❓ 常见问题解答
- 💡 优化建议

---

### 对于项目管理者 → [实施检查清单](./EDUCATION_CHECKLIST.md)
**适合人群**: 需要跟踪实施进度，确保所有步骤正确完成

**内容概览**:
- ✅ 环境准备检查
- ✅ 数据库配置检查
- ✅ 后端服务检查
- ✅ 前端配置检查
- ✅ 功能测试检查
- ✅ 数据验证检查
- 📝 实施记录模板

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────┐
│                   微信小程序前端                      │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 教育首页  │  │ 课程详情  │  │ 课程学习  │          │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘          │
│        │             │             │                │
│        └─────────────┴─────────────┘                │
│                      │                               │
│                 API封装层                            │
│              (utils/api.js)                          │
└──────────────────────┬──────────────────────────────┘
                       │
                  HTTP/HTTPS
                       │
┌──────────────────────┴──────────────────────────────┐
│                  Node.js 后端                        │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   路由层    │  │  控制器层    │  │   模型层    │ │
│  │ courseRoutes│→ │courseController│→│Course Model │ │
│  └─────────────┘  └─────────────┘  └──────┬────────┘ │
└─────────────────────────────────────────┬─────────────┘
                                          │
                                     MySQL查询
                                          │
┌─────────────────────────────────────────┴─────────────┐
│                    MySQL 数据库                        │
│                                                         │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐   │
│  │course_categories│  │ courses  │  │learning_records│   │
│  │   课程分类    │  │   课程   │  │   学习记录   │   │
│  └──────────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📂 项目文件结构

```
StomaCareSystem/
├── backend/                              # 后端服务
│   ├── src/
│   │   ├── controllers/
│   │   │   └── courseController.js      # 课程控制器 ✅
│   │   ├── models/
│   │   │   ├── Course.js                # 课程模型 ✅
│   │   │   └── LearningRecord.js        # 学习记录模型 ✅
│   │   ├── routes/
│   │   │   ├── courseRoutes.js          # 课程路由 ✅
│   │   │   └── index.js                 # 路由注册 ✅
│   │   └── scripts/
│   │       ├── initDatabase.js          # 数据库初始化 ✅
│   │       └── testEducationAPI.js      # API测试脚本 🆕
│   └── package.json
│
├── patientApp/                           # 小程序前端
│   ├── pages/
│   │   └── education/
│   │       ├── education.js             # 教育首页 ✅
│   │       ├── education.wxml           # 页面结构 ✅
│   │       ├── education.wxss           # 页面样式 ✅
│   │       ├── course-list/             # 分类课程列表 ✅
│   │       ├── course-detail/           # 课程详情 ✅
│   │       └── course-study/            # 课程学习 ✅
│   ├── utils/
│   │   └── api.js                       # API封装 ✅
│   ├── config.js                        # 配置文件 ✅
│   └── package.json
│
└── docs/                                 # 文档目录 🆕
    ├── EDUCATION_README.md              # 文档总览（本文件）
    ├── EDUCATION_QUICK_START.md         # 快速开始指南
    ├── EDUCATION_INTEGRATION_GUIDE.md   # 完整实施指南
    └── EDUCATION_CHECKLIST.md           # 实施检查清单
```

**图例**: ✅ 已完成 | 🆕 新增文档

---

## 🔄 数据交互流程

### 1. 获取课程列表流程

```
用户操作: 打开教育页面
    ↓
前端: education.js → onLoad()
    ↓
前端: loadFromBackend()
    ↓
前端: api.getCourses({page: 1, pageSize: 50})
    ↓
HTTP: GET /api/courses?page=1&pageSize=50
    ↓
后端: courseRoutes → GET /
    ↓
后端: courseController.getList()
    ↓
后端: Course.findAll(filters)
    ↓
数据库: SELECT * FROM courses WHERE status='active' ORDER BY...
    ↓
后端: 返回 {success: true, data: [...], pagination: {...}}
    ↓
前端: 解析数据并按分类分组
    ↓
前端: setData() 更新界面
    ↓
用户看到: 课程分类、推荐课程、学习统计
```

### 2. 记录学习进度流程

```
用户操作: 完成课程章节
    ↓
前端: course-study.js → completeChapter()
    ↓
前端: updateStudyProgress(progress)
    ↓
前端: api.recordCourseProgress(courseId, progressData)
    ↓
HTTP: POST /api/courses/:id/progress
      Body: {progress: 50, studyDuration: 300, completed: 0}
    ↓
后端: courseRoutes → POST /:id/progress
    ↓
后端: courseController.recordProgress()
    ↓
后端: LearningRecord.createOrUpdate(recordData)
    ↓
数据库: INSERT ... ON DUPLICATE KEY UPDATE
    ↓
后端: 返回 {success: true, data: {...}, message: '学习记录已更新'}
    ↓
前端: 更新本地缓存
    ↓
前端: 显示成功提示
    ↓
用户看到: "学习进度已更新" + 进度条更新
```

---

## 🛠️ 关键技术点

### 1. JWT身份认证
所有API请求都需要携带JWT Token进行身份验证。

**前端实现**:
```javascript
// utils/api.js
const token = wx.getStorageSync('token')
wx.request({
  header: {
    'Authorization': `Bearer ${token}`
  }
})
```

**后端实现**:
```javascript
// middlewares/auth.js
router.use(verifyToken);
```

### 2. 数据双向同步
学习进度同时保存到后端数据库和本地缓存，保证离线可用。

**同步策略**:
- 优先同步到后端
- 后端失败时保存到本地
- 下次联网时重新同步

### 3. 分类数据映射
前后端使用不同的分类标识，需要映射转换。

**映射关系**:
```javascript
数据库ID → 前端类型
1 → 'basic'      (基础护理)
2 → 'practice'   (实操技巧)
3 → 'diet'       (饮食指导)
4 → 'emergency'  (应急处理)
5 → 'psychology' (心理康复)
```

### 4. 学习记录去重
使用数据库的 `ON DUPLICATE KEY UPDATE` 防止重复记录。

**SQL实现**:
```sql
INSERT INTO learning_records (patient_id, course_id, ...)
VALUES (?, ?, ...)
ON DUPLICATE KEY UPDATE
  progress = VALUES(progress),
  study_duration = study_duration + VALUES(study_duration),
  last_study_at = NOW()
```

---

## 📊 API端点总览

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/courses/categories` | 获取课程分类 | ✅ |
| GET | `/api/courses` | 获取课程列表 | ✅ |
| GET | `/api/courses/:id` | 获取课程详情 | ✅ |
| POST | `/api/courses/:id/progress` | 记录学习进度 | ✅ |
| GET | `/api/courses/my-learning` | 获取学习记录 | ✅ |
| POST | `/api/courses/:id/like` | 点赞课程 | ✅ |

---

## 🗄️ 数据库表结构

### course_categories (课程分类表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(50) | 分类名称 |
| icon | VARCHAR(100) | 图标 |
| description | TEXT | 描述 |
| sort_order | INT | 排序 |
| status | ENUM | 状态 |

### courses (课程表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| category_id | INT | 分类ID |
| title | VARCHAR(200) | 标题 |
| cover_image | VARCHAR(255) | 封面图 |
| description | TEXT | 描述 |
| content | LONGTEXT | 内容 |
| video_url | VARCHAR(255) | 视频URL |
| duration | INT | 时长(秒) |
| difficulty | ENUM | 难度 |
| view_count | INT | 浏览量 |
| like_count | INT | 点赞数 |

### learning_records (学习记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| patient_id | INT | 患者ID |
| course_id | INT | 课程ID |
| progress | INT | 进度(0-100) |
| completed | TINYINT | 是否完成 |
| last_position | INT | 最后位置 |
| study_duration | INT | 学习时长(秒) |
| last_study_at | DATETIME | 最后学习时间 |

**重要约束**:
- `UNIQUE KEY (patient_id, course_id)` - 防止重复记录

---

## 🧪 测试工具

### 1. API测试脚本
```bash
# 自动测试所有教育API
node backend/src/scripts/testEducationAPI.js
```

**测试内容**:
- ✅ API健康检查
- ✅ 获取课程分类
- ✅ 获取课程列表
- ✅ 获取课程详情
- ✅ 记录学习进度（需要Token）
- ✅ 获取学习记录（需要Token）
- ✅ 点赞课程（需要Token）

### 2. 数据库验证查询
```sql
-- 查看课程统计
SELECT 
  cc.name as category_name,
  COUNT(*) as course_count
FROM courses c
JOIN course_categories cc ON c.category_id = cc.id
GROUP BY c.category_id;

-- 查看学习记录统计
SELECT 
  p.name as patient_name,
  COUNT(*) as total_courses,
  SUM(completed) as completed_courses,
  SUM(study_duration) as total_duration
FROM learning_records lr
JOIN patients p ON lr.patient_id = p.id
GROUP BY lr.patient_id;
```

---

## 📈 功能扩展建议

### 短期优化（1-2周）
- [ ] 添加课程搜索功能
- [ ] 实现课程评论和评分
- [ ] 添加学习提醒功能
- [ ] 优化图片加载性能

### 中期优化（1个月）
- [ ] 集成视频播放功能
- [ ] 实现学习证书系统
- [ ] 添加学习排行榜
- [ ] 支持课程下载离线学习

### 长期优化（3个月）
- [ ] AI个性化推荐课程
- [ ] 实现直播课程功能
- [ ] 添加在线考试系统
- [ ] 建立学习社区

---

## 💻 开发环境要求

### 最低配置
- **Node.js**: v14.0+
- **MySQL**: v5.7+
- **微信开发者工具**: 最新稳定版
- **操作系统**: Windows 10+ / macOS 10.14+ / Ubuntu 18.04+

### 推荐配置
- **Node.js**: v18.0+
- **MySQL**: v8.0+
- **内存**: 8GB+
- **硬盘**: 至少10GB可用空间

---

## 📞 技术支持

### 遇到问题？

1. **查看文档**
   - [快速开始指南](./EDUCATION_QUICK_START.md)
   - [完整实施指南](./EDUCATION_INTEGRATION_GUIDE.md)
   - [检查清单](./EDUCATION_CHECKLIST.md)

2. **运行测试脚本**
   ```bash
   node backend/src/scripts/testEducationAPI.js
   ```

3. **查看日志**
   - 后端日志: `backend/logs/`
   - 小程序控制台: 微信开发者工具
   - 数据库日志: MySQL error log

4. **常见问题**
   - 参考文档中的"常见问题"章节
   - 检查网络配置
   - 验证数据库连接

---

## 🎓 学习资源

### 相关技术文档
- [Express.js官方文档](https://expressjs.com/)
- [MySQL官方文档](https://dev.mysql.com/doc/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

### 项目相关
- [API接口文档](./EDUCATION_INTEGRATION_GUIDE.md#api接口说明)
- [数据库设计](./EDUCATION_INTEGRATION_GUIDE.md#数据流程图)
- [测试方法](./EDUCATION_INTEGRATION_GUIDE.md#测试验证)

---

## 📝 更新日志

### v1.0.0 (2025-11-08)
- ✅ 完成护理教育模块前后端开发
- ✅ 实现课程浏览、学习、进度记录功能
- ✅ 创建完整的实施文档
- ✅ 添加API测试脚本
- ✅ 提供快速开始指南

---

## 👥 贡献者

感谢所有为本项目做出贡献的开发者！

---

**文档维护**: StomaCareSystem Team  
**最后更新**: 2025-11-08  
**版本**: 1.0.0

