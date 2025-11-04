# 快速启动指南

## 5分钟快速上手

### 1️⃣ 安装依赖
```bash
cd backend
npm install
```

### 2️⃣ 配置数据库
```bash
# 1. 确保MySQL已启动
# 2. 复制环境变量文件
copy .env.example .env

# 3. 编辑 .env 文件，修改数据库密码
# DB_PASSWORD=你的MySQL密码
```

### 3️⃣ 初始化数据库
```bash
npm run init-db
```

### 4️⃣ 测试连接
```bash
npm run test-db
```

### 5️⃣ 启动服务
```bash
# 开发模式（推荐）
npm run dev

# 或生产模式
npm start
```

## 验证服务

访问 http://localhost:3000/api/health

看到以下响应表示成功：
```json
{
  "success": true,
  "message": "服务运行正常"
}
```

## 主要API端点

| 功能 | 端点 | 说明 |
|------|------|------|
| 健康检查 | `GET /api/health` | 检查服务状态 |
| 患者登录 | `POST /api/auth/login/patient` | 微信登录 |
| AI评估 | `POST /api/assessments` | 上传图片分析 |
| 症状日记 | `POST /api/diaries` | 记录症状 |
| 护理课程 | `GET /api/courses` | 获取课程列表 |
| 健康报告 | `GET /api/reports/my-report` | 生成报告 |

## 测试登录

### 方法1: 使用模拟登录（开发测试）

由于微信登录需要真实的微信小程序环境，开发时可以暂时跳过微信验证：

1. 修改 `src/services/authService.js` 添加测试登录方法
2. 或者配置真实的微信小程序参数

### 方法2: 配置微信小程序

在 `.env` 文件中配置：
```env
WECHAT_APPID=你的小程序AppID
WECHAT_SECRET=你的小程序Secret
```

## 常用命令

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start

# 初始化数据库
npm run init-db

# 测试数据库连接
npm run test-db
```

## 文件上传测试

使用Postman或其他API工具测试文件上传：

```
POST http://localhost:3000/api/assessments
Content-Type: multipart/form-data

Headers:
Authorization: Bearer <your_token>

Body:
image: [选择文件]
```

## 目录说明

```
backend/
├── src/
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器（处理请求）
│   ├── models/          # 数据模型（数据库操作）
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑
│   ├── middlewares/     # 中间件（认证、错误处理等）
│   ├── utils/           # 工具函数
│   └── server.js        # 入口文件
├── uploads/             # 上传文件存储（自动创建）
└── .env                 # 环境变量配置
```

## 下一步

1. 📖 查看完整文档：`API.md`
2. 🔧 详细安装说明：`INSTALL.md`
3. 📚 项目说明：`README.md`

## 问题排查

### 端口被占用
修改 `.env` 中的 `PORT=3000` 为其他端口

### 数据库连接失败
- 检查MySQL是否启动
- 检查 `.env` 中的数据库配置
- 运行 `npm run test-db` 测试连接

### 文件上传失败
- 确认 `uploads` 目录存在
- 检查文件大小限制（默认5MB）

## 开发提示

- 开发模式下使用 `npm run dev`，代码修改会自动重启
- 所有API请求日志会在控制台显示
- JWT Token有效期为7天
- 上传的文件保存在 `uploads/` 目录

## 获取帮助

- 查看API文档了解所有接口
- 检查控制台日志排查问题
- 使用 `npm run test-db` 测试数据库连接




