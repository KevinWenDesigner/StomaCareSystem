# 造口护理系统后端 - 安装指南

## 环境要求

- Node.js >= 14.0.0
- MySQL >= 5.7
- npm 或 yarn

## 安装步骤

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置数据库

创建MySQL数据库：

```sql
CREATE DATABASE stoma_care_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

编辑 `.env` 文件，填写以下配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stoma_care_db

# JWT密钥（生产环境务必修改）
JWT_SECRET=your_secret_key_here

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
```

### 4. 初始化数据库

运行数据库初始化脚本：

```bash
npm run init-db
```

这将创建所有必要的数据表并插入初始数据。

### 5. 启动服务

**开发模式**（自动重启）：
```bash
npm run dev
```

**生产模式**：
```bash
npm start
```

### 6. 验证安装

服务启动后，访问以下地址检查：

- 健康检查: http://localhost:3000/api/health
- API首页: http://localhost:3000/

如果返回JSON响应，说明服务启动成功。

## 目录结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.js  # 数据库配置
│   │   ├── jwt.js       # JWT配置
│   │   ├── upload.js    # 文件上传配置
│   │   └── wechat.js    # 微信配置
│   ├── controllers/     # 控制器层
│   ├── models/          # 数据模型层
│   ├── routes/          # 路由层
│   ├── middlewares/     # 中间件
│   ├── services/        # 业务逻辑层
│   ├── utils/           # 工具函数
│   ├── scripts/         # 脚本
│   │   └── initDatabase.js
│   └── server.js        # 入口文件
├── uploads/             # 上传文件目录（自动创建）
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
├── package.json         # 项目配置
└── README.md            # 项目说明
```

## 常见问题

### 1. 数据库连接失败

**错误**: `数据库连接失败: ER_ACCESS_DENIED_ERROR`

**解决方案**:
- 检查 `.env` 中的数据库用户名和密码是否正确
- 确认MySQL服务是否已启动
- 确认数据库用户是否有足够的权限

### 2. 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
- 修改 `.env` 中的 `PORT` 为其他端口
- 或者关闭占用3000端口的其他程序

### 3. 上传文件失败

**错误**: 文件上传相关错误

**解决方案**:
- 确认 `uploads` 目录存在且有写入权限
- 检查 `.env` 中的 `MAX_FILE_SIZE` 配置
- 确认磁盘空间充足

### 4. JWT Token验证失败

**错误**: `无效的令牌` 或 `令牌已过期`

**解决方案**:
- 检查请求头中是否正确设置 `Authorization: Bearer <token>`
- Token可能已过期，需要重新登录
- 确认 `.env` 中的 `JWT_SECRET` 配置正确

## 开发说明

### 添加新的API接口

1. 在 `src/models/` 中创建数据模型
2. 在 `src/services/` 中实现业务逻辑（可选）
3. 在 `src/controllers/` 中创建控制器
4. 在 `src/routes/` 中定义路由
5. 在 `src/routes/index.js` 中注册路由

### 数据库迁移

如果需要修改数据库结构：

1. 修改 `src/scripts/initDatabase.js`
2. 重新运行 `npm run init-db`（注意：会清空现有数据）

### 日志查看

开发模式下，所有API请求都会在控制台输出日志。

生产模式建议使用日志管理工具（如PM2）来管理日志。

## 部署建议

### 使用PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start src/server.js --name stoma-care-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs stoma-care-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 生产环境配置

1. 修改 `.env` 中的 `NODE_ENV=production`
2. 使用强密码作为 `JWT_SECRET`
3. 配置反向代理（如Nginx）
4. 启用HTTPS
5. 配置数据库备份
6. 设置日志轮转

## 技术支持

如有问题，请查看：
- API文档: `API.md`
- 项目说明: `README.md`

## 许可证

MIT




