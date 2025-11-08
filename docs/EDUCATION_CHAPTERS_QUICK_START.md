# 添加课程章节内容 - 3分钟快速开始

## 🎯 目标

为护理教育模块添加详细的课程章节内容，让学习页面显示真实的学习材料。

---

## ⚡ 三步完成

### 步骤1: 运行脚本（1分钟）

```bash
cd backend
node src/scripts/addCourseChapters.js
```

**成功标志：**
```
🎉 课程章节功能添加完成！
```

---

### 步骤2: 重启服务（30秒）

```bash
# 按 Ctrl+C 停止当前服务
# 重新启动
npm run dev
```

---

### 步骤3: 测试效果（1分钟）

1. 打开小程序
2. 进入"教育"模块
3. 点击"认识造口"或"造口用品认知"课程
4. 点击"开始学习"
5. 查看章节内容是否显示

**预期效果：**
- ✅ 看到详细的HTML格式的课程内容
- ✅ 看到"本章学习要点"列表
- ✅ 看到"预计学习时间"提示

---

## ✅ 完成！

现在您的课程已经有详细的学习内容了！

### 已添加的内容

**课程1：认识造口** - 3个章节
- 什么是造口（5分钟）
- 造口的类型（8分钟）
- 造口护理的重要性（7分钟）

**课程2：造口用品认知** - 3个章节
- 造口袋的种类（7分钟）
- 底盘的选择（6分钟）
- 辅助用品介绍（8分钟）

---

## 📝 需要添加更多内容？

查看完整指南：[EDUCATION_CHAPTERS_GUIDE.md](./EDUCATION_CHAPTERS_GUIDE.md)

---

## ❓ 遇到问题？

### 章节内容不显示？

**快速检查：**
```sql
-- 连接MySQL
USE stoma_care;

-- 查看章节数据
SELECT course_id, COUNT(*) as chapter_count 
FROM course_chapters 
GROUP BY course_id;
```

如果没有数据，重新运行步骤1的脚本。

### 样式显示异常？

在 `patientApp/pages/education/course-study/course-study.wxss` 末尾添加：

```css
/* 复制 course-study-additions.wxss 中的内容 */
.rich-content {
  margin-top: 24rpx;
  font-size: 28rpx;
  line-height: 1.8;
}

.learning-points {
  margin-top: 40rpx;
  padding: 24rpx;
  background: #fffbe6;
  border-radius: 12rpx;
}
```

---

**就这么简单！** 🎉

