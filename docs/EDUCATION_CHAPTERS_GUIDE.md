# 护理教育模块 - 章节内容系统使用指南

## 📚 概述

本指南说明如何为护理教育模块添加详细的课程章节内容，让学习页面展示真实的学习材料而不是模拟数据。

---

## 🎯 新增功能

### 1. 数据库层
- ✅ **course_chapters 表** - 存储课程章节详细内容
- ✅ **章节内容字段** - 支持HTML富文本内容
- ✅ **学习要点字段** - JSON格式存储学习要点

### 2. 后端API
- ✅ **章节模型** - CourseChapter.js
- ✅ **获取章节列表** - GET `/api/courses/:id/chapters`
- ✅ **获取单个章节** - GET `/api/courses/:id/chapters/:chapterId`
- ✅ **课程详情包含章节** - 自动关联返回

### 3. 前端展示
- ✅ **富文本渲染** - 支持HTML内容展示
- ✅ **学习要点列表** - 格式化展示学习要点
- ✅ **章节时长提示** - 显示预计学习时间
- ✅ **自动加载章节** - 从后端获取详细内容

---

## 🚀 快速开始

### 步骤1: 运行章节数据脚本

```bash
cd backend
node src/scripts/addCourseChapters.js
```

**预期输出：**
```
🚀 开始添加课程章节功能...
✅ 数据库连接成功
📝 创建课程章节表...
✅ 课程章节表创建成功
📚 插入课程章节数据...
✅ 课程章节数据插入成功
🎉 课程章节功能添加完成！
```

### 步骤2: 重启后端服务

```bash
# 停止当前服务（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤3: 测试功能

1. 打开小程序
2. 进入教育模块
3. 点击任意课程查看详情
4. 点击"开始学习"
5. 查看是否显示真实的章节内容

---

## 📊 数据库结构

### course_chapters 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| course_id | INT | 课程ID（外键） |
| chapter_order | INT | 章节序号 |
| title | VARCHAR(200) | 章节标题 |
| content | LONGTEXT | 章节内容（HTML） |
| video_url | VARCHAR(255) | 视频URL（可选） |
| duration | INT | 时长（秒） |
| learning_points | JSON | 学习要点数组 |
| status | ENUM | 状态（active/inactive） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**索引和约束：**
- `FOREIGN KEY (course_id)` - 关联到courses表
- `UNIQUE KEY (course_id, chapter_order)` - 同一课程的章节序号唯一

---

## 🎨 章节内容格式

### HTML内容示例

```html
<h2>章节标题</h2>
<p>段落文字...</p>

<h3>小节标题</h3>
<ul>
  <li>列表项1</li>
  <li>列表项2</li>
</ul>

<div class="tip-box">
  <strong>💡 重要提示：</strong>
  <p>提示内容...</p>
</div>
```

### 学习要点格式

```json
[
  "学习要点1",
  "学习要点2",
  "学习要点3"
]
```

---

## 📡 API接口

### 1. 获取课程详情（包含章节）

```
GET /api/courses/:id
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "认识造口",
    "description": "...",
    "chapters": [
      {
        "id": 1,
        "course_id": 1,
        "chapter_order": 1,
        "title": "什么是造口",
        "content": "<h2>造口的定义</h2><p>...</p>",
        "duration": 300,
        "learning_points": ["要点1", "要点2"]
      }
    ]
  }
}
```

### 2. 获取章节列表

```
GET /api/courses/:id/chapters
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "什么是造口",
      "duration": 300,
      ...
    }
  ]
}
```

### 3. 获取单个章节详情

```
GET /api/courses/:id/chapters/:chapterId
```

---

## 💻 前端实现

### 章节内容渲染

```xml
<!-- course-study.wxml -->
<view class="rich-content">
  <rich-text nodes="{{course.chapters[currentChapter].content}}"></rich-text>
</view>
```

### 学习要点展示

```xml
<view class="learning-points">
  <view wx:for="{{course.chapters[currentChapter].learning_points}}" 
        wx:key="*this" 
        class="point-item">
    <text class="point-bullet">•</text>
    <text class="point-text">{{item}}</text>
  </view>
</view>
```

### 样式补充

在 `course-study.wxss` 末尾添加：

```css
/* 富文本内容样式 */
.rich-content {
  margin-top: 24rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
}

/* 章节时长提示 */
.chapter-meta {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f0f7ff;
  border-radius: 12rpx;
}

/* 学习要点优化 */
.learning-points {
  margin-top: 40rpx;
  padding: 24rpx;
  background: #fffbe6;
  border-radius: 12rpx;
  border-left: 4rpx solid #faad14;
}
```

*（完整样式请参考 `course-study-additions.wxss` 文件）*

---

## ✅ 已添加的课程内容

### 课程1：认识造口

| 章节 | 标题 | 时长 | 内容概要 |
|------|------|------|----------|
| 第1章 | 什么是造口 | 5分钟 | 造口的定义、作用、常见情况 |
| 第2章 | 造口的类型 | 8分钟 | 结肠/回肠/尿路造口的区别 |
| 第3章 | 造口护理的重要性 | 7分钟 | 预防并发症、提高生活质量 |

### 课程2：造口用品认知

| 章节 | 标题 | 时长 | 内容概要 |
|------|------|------|----------|
| 第1章 | 造口袋的种类 | 7分钟 | 一件式/两件式/开口/闭口袋 |
| 第2章 | 底盘的选择 | 6分钟 | 底盘类型、材质、开孔尺寸 |
| 第3章 | 辅助用品介绍 | 8分钟 | 防漏、保护、清洁、除臭用品 |

---

## 📝 添加更多章节内容

### 方法1: 直接SQL插入

```sql
INSERT INTO course_chapters 
(course_id, chapter_order, title, content, duration, learning_points) 
VALUES
(3, 1, '章节标题', '<h2>内容</h2><p>...</p>', 300, '["要点1", "要点2"]');
```

### 方法2: 通过脚本添加

修改 `addCourseChapters.js` 文件，添加更多课程的章节数据：

```javascript
// 课程3：造口袋更换步骤
await connection.query(`
  INSERT INTO course_chapters (course_id, chapter_order, title, content, duration, learning_points) VALUES
  (3, 1, '更换前准备', '<h2>准备工作</h2><p>...</p>', 480, '["准备用物清单", "环境要求", "时机选择"]'),
  (3, 2, '操作步骤', '<h2>详细步骤</h2><p>...</p>', 720, '["揭除旧袋", "清洁造口", "粘贴新袋"]'),
  (3, 3, '注意事项', '<h2>重要提示</h2><p>...</p>', 420, '["常见错误", "预防漏液", "紧急处理"]')
  ON DUPLICATE KEY UPDATE title=title;
`);
```

### 方法3: 创建后台管理界面（未来功能）

可以开发一个管理后台，让护士或管理员直接在界面上添加和编辑课程章节内容。

---

## 🔧 故障排查

### Q1: 章节内容不显示

**检查步骤：**
1. 确认是否运行了 `addCourseChapters.js`
2. 查看数据库中是否有章节数据
   ```sql
   SELECT * FROM course_chapters WHERE course_id = 1;
   ```
3. 检查后端日志是否有错误
4. 查看小程序控制台，确认API返回的数据

**解决方案：**
- 重新运行章节脚本
- 重启后端服务
- 检查Course Controller中是否正确引入了CourseChapter模型

### Q2: 富文本渲染异常

**可能原因：**
- HTML内容格式不正确
- 小程序不支持某些HTML标签

**解决方案：**
- 使用小程序支持的标签：`<div>`, `<span>`, `<h1-h6>`, `<p>`, `<ul>`, `<ol>`, `<li>`
- 避免使用`<table>`, `<iframe>`, `<script>`等标签
- 测试简单内容：`<p>测试文本</p>`

### Q3: 学习要点不显示

**检查步骤：**
1. 查看数据库中learning_points字段格式
   ```sql
   SELECT learning_points FROM course_chapters WHERE id = 1;
   ```
2. 确认是否是valid JSON格式
3. 检查前端是否正确解析

**解决方案：**
- 确保数据库存储的是valid JSON数组
- 前端添加JSON解析错误处理

### Q4: 章节表不存在

**错误信息：**
```
Table 'stoma_care.course_chapters' doesn't exist
```

**解决方案：**
```bash
node backend/src/scripts/addCourseChapters.js
```

---

## 🎯 内容编写建议

### 1. 章节标题
- 简洁明了，突出重点
- 使用动词开头（如"了解"、"掌握"、"学习"）
- 控制在15字以内

### 2. 章节内容
- 结构清晰，使用标题层级（h2, h3）
- 重点内容使用粗体或提示框
- 适当配图（存储图片URL）
- 控制字数：每章500-1500字

### 3. 学习要点
- 3-5个要点为宜
- 每个要点1句话概括
- 使用"掌握"、"了解"、"理解"等动词

### 4. 时长设置
- 初级：300-600秒（5-10分钟）
- 中级：600-1200秒（10-20分钟）
- 高级：1200-1800秒（20-30分钟）

---

## 📈 数据统计

### 查看课程章节统计

```sql
SELECT 
  c.id,
  c.title as course_title,
  COUNT(cc.id) as chapter_count,
  SUM(cc.duration) as total_duration,
  c.difficulty
FROM courses c
LEFT JOIN course_chapters cc ON c.id = cc.course_id
GROUP BY c.id
ORDER BY c.id;
```

### 查看学习完成情况

```sql
SELECT 
  c.title as course_title,
  COUNT(DISTINCT lr.patient_id) as learner_count,
  AVG(lr.progress) as avg_progress,
  SUM(lr.completed) as completed_count
FROM courses c
LEFT JOIN learning_records lr ON c.id = lr.course_id
GROUP BY c.id;
```

---

## 🎉 总结

通过本指南，您已经：

✅ 创建了course_chapters表存储详细章节内容  
✅ 添加了CourseChapter模型和相关API  
✅ 更新了前端以展示真实的学习内容  
✅ 为前两门课程添加了详细的章节数据  
✅ 了解了如何继续添加更多课程内容  

现在，护理教育模块已经拥有完整的学习内容系统！

---

## 📞 下一步

1. **添加更多课程内容** - 为剩余课程添加章节
2. **添加视频支持** - 上传课程视频并关联到章节
3. **优化富文本样式** - 自定义富文本渲染样式
4. **添加章节测验** - 每章结束后添加小测验
5. **开发内容管理后台** - 可视化编辑课程内容

---

**文档版本**: 1.0.0  
**创建日期**: 2025-11-08  
**更新日期**: 2025-11-08

