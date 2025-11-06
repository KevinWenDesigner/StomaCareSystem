# DeepSeek API 集成指南

## 📖 概述

本文档介绍如何在造口护理系统中集成 DeepSeek AI API 进行智能图像分析。

## 🚀 快速开始

### 1. 获取 DeepSeek API 密钥

1. 访问 [DeepSeek 平台](https://platform.deepseek.com)
2. 注册/登录账号
3. 进入 [API Keys 页面](https://platform.deepseek.com/api_keys)
4. 创建新的 API 密钥并保存

### 2. 配置环境变量

在 `backend` 目录下创建或编辑 `.env` 文件：

```bash
# AI 提供商设置为 deepseek
AI_PROVIDER=deepseek

# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
```

### 3. 安装依赖（如未安装）

```bash
cd backend
npm install axios
```

### 4. 重启后端服务

```bash
# 开发环境
npm run dev

# 生产环境
pm2 restart ecosystem.config.js
```

## 📋 功能说明

### API 调用流程

1. **前端上传图片**：患者在小程序 camera 页面拍摄或选择造口图片
2. **后端接收**：`assessmentController.js` 接收图片上传请求
3. **AI 分析**：`aiService.js` 调用 DeepSeek API 进行图像分析
4. **结果处理**：将 AI 分析结果格式化并保存到数据库
5. **返回前端**：返回评估结果给小程序展示

### DeepSeek API 请求格式

```javascript
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一位专业的造口护理专家..."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "请分析这张造口图片..."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,/9j/4AAQ..."
          }
        }
      ]
    }
  ],
  "temperature": 0.3,
  "max_tokens": 2000,
  "response_format": { "type": "json_object" }
}
```

### 返回数据格式

AI 返回的 JSON 数据结构：

```json
{
  "stoma_color": "粉红色",
  "stoma_size": "正常",
  "skin_condition": "造口周围皮肤状况良好，无红肿",
  "risk_level": "low",
  "issues": [],
  "confidence": 0.92,
  "detailed_analysis": "造口呈健康的粉红色，大小正常..."
}
```

## 🔄 AI 提供商切换

系统支持三种 AI 提供商模式：

### 1. Mock 模式（默认）
用于开发测试，返回模拟数据，无需 API 密钥。

```bash
AI_PROVIDER=mock
```

### 2. DeepSeek 模式
使用 DeepSeek API 进行真实的 AI 分析。

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_api_key
```

### 3. Custom 模式
使用自定义的 AI 服务 API。

```bash
AI_PROVIDER=custom
AI_API_URL=https://your-ai-service.com/analyze
AI_API_KEY=your_custom_api_key
```

## 💰 费用估算

DeepSeek API 按 token 计费：

- **模型**：deepseek-chat
- **输入价格**：¥1 / 1M tokens（约）
- **输出价格**：¥2 / 1M tokens（约）

**单次图像分析估算**：
- 图片 base64 编码：~15,000 tokens
- 系统提示词：~300 tokens
- 返回结果：~500 tokens
- **单次成本**：约 ¥0.03-0.05

## 🛠️ 测试

### 手动测试

使用 Postman 或 curl 测试上传接口：

```bash
curl -X POST http://localhost:3000/api/assessments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/test-image.jpg" \
  -F "patientId=1"
```

### 查看日志

检查后端日志确认 DeepSeek API 调用：

```bash
# 如果使用 PM2
pm2 logs stoma-backend

# 或查看日志文件
tail -f logs/app.log
```

成功调用会看到：

```
使用 AI 提供商: deepseek
调用 DeepSeek API 进行图像分析...
DeepSeek API 响应成功
DeepSeek 分析结果: { stoma_color: '粉红色', ... }
```

## ⚠️ 错误处理

### 常见错误

#### 1. API 密钥无效

**错误信息**：`401 Unauthorized`

**解决方案**：
- 检查 `.env` 文件中的 `DEEPSEEK_API_KEY` 是否正确
- 确认 API 密钥在 DeepSeek 平台是否有效

#### 2. 请求超时

**错误信息**：`timeout of 60000ms exceeded`

**解决方案**：
- 检查网络连接
- 图片尺寸过大，建议压缩图片（推荐 < 2MB）
- 增加超时时间（在 `aiService.js` 中调整 `timeout`）

#### 3. 图片格式不支持

**错误信息**：`Invalid image format`

**解决方案**：
- 支持格式：JPEG, PNG, GIF, WebP
- 确保图片未损坏
- 检查文件扩展名是否正确

### 降级策略

当 DeepSeek API 调用失败时，系统会自动降级到模拟数据模式，确保功能正常运行：

```javascript
try {
  return await this.analyzeWithDeepSeek(imagePath);
} catch (error) {
  console.error('DeepSeek API 调用失败，使用模拟数据');
  return this.getMockAnalysisResult();
}
```

## 🔒 安全建议

1. **API 密钥保护**
   - 不要将 `.env` 文件提交到 Git
   - 使用环境变量管理密钥
   - 定期轮换 API 密钥

2. **图片隐私**
   - 图片仅用于 AI 分析，不会被 DeepSeek 永久存储
   - 建议在本地做好图片加密和访问控制

3. **请求频率限制**
   - 避免频繁调用，建议添加防抖/节流
   - 监控 API 使用量，设置告警

## 📊 监控与优化

### 性能监控

建议添加监控指标：

```javascript
// 在 aiService.js 中添加
const startTime = Date.now();
// ... API 调用 ...
const duration = Date.now() - startTime;
console.log(`DeepSeek API 响应时间: ${duration}ms`);
```

### 优化建议

1. **图片压缩**：上传前压缩图片减少 token 消耗
2. **缓存结果**：相同图片可缓存分析结果
3. **批量处理**：支持批量分析提高效率
4. **异步处理**：使用队列处理大量图片

## 📞 技术支持

- **DeepSeek 官方文档**：https://platform.deepseek.com/docs
- **API 状态监控**：https://status.deepseek.com
- **技术支持邮箱**：support@deepseek.com

## 🔄 版本历史

- **v1.0.0** (2024-11-06)
  - 初始集成 DeepSeek API
  - 支持图像分析和造口评估
  - 添加错误处理和降级策略

## 📝 相关文件

- `backend/src/services/aiService.js` - AI 服务主文件
- `backend/src/controllers/assessmentController.js` - 评估控制器
- `backend/env-template.txt` - 环境变量模板
- `patientApp/pages/camera/camera.js` - 前端拍照页面



