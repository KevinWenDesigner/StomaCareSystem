# 图片404错误修复指南

## 问题描述

在微信小程序中显示评估历史时，出现大量图片加载失败（404错误）的情况。

### 错误日志
```
[渲染层网络层错误] Failed to load image <URL>
the server responded with a status of 404 (HTTP/1.1 404 Not Found)
```

### 根本原因

数据库中存储的评估记录引用了不存在的图片文件。这可能是由于：
1. 文件被误删除
2. 数据库和文件系统之间的同步问题
3. 测试数据包含了无效的图片路径
4. 开发环境和生产环境数据不一致

## 解决方案

### 1. 后端：清理无效的评估记录

#### 步骤1：检查数据库

运行以下脚本检查哪些评估记录的图片文件缺失：

```bash
cd backend/src/scripts
node cleanupMissingImages.js
```

这将输出：
- 有效图片数量
- 缺失图片数量
- 缺失图片的详细信息

#### 步骤2：导出缺失记录（可选）

如果需要备份这些记录：

```bash
node cleanupMissingImages.js --export
```

这会生成 `missing_images_report.json` 文件。

#### 步骤3：删除无效记录

确认后删除这些无效记录：

```bash
node cleanupMissingImages.js --delete
```

### 2. 前端：添加图片错误处理

已在以下文件中添加了图片加载错误处理：

#### 文件修改列表

1. **patientApp/pages/camera/camera.wxml**
   - 为历史记录图片添加 `binderror` 事件处理器

2. **patientApp/pages/camera/camera.js**
   - 添加 `onImageError` 方法处理图片加载失败

3. **patientApp/pages/camera/history/history.wxml**
   - 为历史页面图片添加 `binderror` 事件处理器

4. **patientApp/pages/camera/history/history.js**
   - 添加 `onImageError` 方法处理图片加载失败

#### 错误处理逻辑

当图片加载失败时：
1. 在控制台记录警告信息
2. 将图片路径替换为占位图（需要创建）
3. 标记该项为图片错误状态

### 3. 添加占位图（推荐）

创建一个占位图来替代加载失败的图片：

#### 选项A：使用在线工具生成

1. 访问 https://placeholder.com/ 或类似服务
2. 生成一个 300x300 的灰色占位图
3. 保存为 `patientApp/images/image-placeholder.png`

#### 选项B：使用默认相机图标

修改错误处理代码，使用现有的相机图标：

```javascript
// 在 onImageError 方法中
photoPath: '/images/camera.png' // 使用现有图标
```

### 4. 预防措施

#### 后端

在 `assessmentController.js` 的删除方法中，确保同时删除文件：

```javascript
static async delete(req, res, next) {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);
    
    if (!assessment) {
      return response.notFound(res, '评估记录不存在');
    }
    
    // 删除图片文件
    if (assessment.image_url) {
      const imagePath = path.join(__dirname, '../../', assessment.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // 删除数据库记录
    await Assessment.delete(id);
    
    return response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
}
```

#### 定期维护

创建定时任务定期检查和清理：

```javascript
// backend/src/scripts/scheduledCleanup.js
const cron = require('node-cron');

// 每天凌晨2点运行清理
cron.schedule('0 2 * * *', async () => {
  console.log('开始定期清理...');
  // 运行清理逻辑
});
```

## 验证修复

### 1. 清理数据库后

```bash
cd backend/src/scripts
node cleanupMissingImages.js
```

应该显示：
```
✅ 有效图片: X 个
❌ 缺失图片: 0 个
🎉 所有评估记录的图片都存在，无需清理！
```

### 2. 测试前端

1. 打开微信开发者工具
2. 进入"AI智能评估"页面
3. 查看历史记录
4. 打开控制台，应该不再有 404 错误
5. 如果仍有缺失图片，应该显示占位图而不是空白或错误

## 当前状态

### 已完成
- ✅ 创建数据库清理脚本
- ✅ 添加前端图片错误处理
- ✅ 更新历史页面错误处理

### 待完成
- ⚠️ 添加占位图片文件
- ⚠️ 更新后端删除逻辑（可选）
- ⚠️ 添加定期清理任务（可选）

## 快速修复步骤

如果现在就要解决这个问题：

1. **立即修复**：
```bash
# 进入后端目录
cd backend/src/scripts

# 运行清理脚本（仅查看）
node cleanupMissingImages.js

# 确认后删除
node cleanupMissingImages.js --delete
```

2. **临时占位图**：
修改 `camera.js` 和 `history.js` 中的 `onImageError` 方法：
```javascript
photoPath: '/images/camera.png' // 使用现有相机图标作为临时占位图
```

3. **重新加载小程序**：
在微信开发者工具中点击"编译"按钮

## 技术细节

### 图片路径格式

- 数据库存储：`/uploads/assessments/image_1762506419752_788789213.jpg`
- 文件系统路径：`backend/uploads/assessments/image_1762506419752_788789213.jpg`
- 访问URL：`https://stoma.ht-healthcare.com/uploads/assessments/image_1762506419752_788789213.jpg`

### 静态文件配置

在 `backend/src/server.js` 第44行：
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

这个配置将 `/uploads` URL 映射到 `backend/uploads` 目录。

## 监控和日志

### 前端日志

图片加载失败时会输出：
```
图片加载失败，评估ID: xxx
```

### 后端日志

可以添加中间件记录 404 请求：
```javascript
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 404 && req.url.startsWith('/uploads/')) {
      console.warn(`404: ${req.url}`);
    }
  });
  next();
});
```

## 联系支持

如果问题持续存在，请：
1. 检查服务器上 `backend/uploads/assessments/` 目录的权限
2. 验证 Nginx/Apache 配置是否正确转发静态文件请求
3. 查看服务器日志了解更多详情

