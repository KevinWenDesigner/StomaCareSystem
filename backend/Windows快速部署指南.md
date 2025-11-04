# Windows 服务器快速部署指南

## 🚀 5分钟快速部署（已有环境）

适用于：已经在 Windows 服务器上安装了 Node.js、MySQL、PM2 的情况。

---

## 前置条件

- ✅ Windows Server（Windows Server 2016/2019/2022 或 Windows 10/11）
- ✅ 已安装 Node.js 14+
- ✅ 已安装 MySQL 5.7+
- ✅ 已安装 PM2
- ✅ 有公网IP
- ✅ 有域名

> 如果还没安装环境，请参考：[WINDOWS部署指南.md](./WINDOWS部署指南.md)

---

## 快速部署步骤

### 步骤1：上传代码

将 `backend` 文件夹上传到服务器（推荐位置：`C:\www\backend`）

**上传方式：**
- 远程桌面直接复制粘贴
- 使用 WinSCP、FileZilla 等工具

### 步骤2：配置数据库

打开 **MySQL 命令行** 或 **MySQL Workbench**：

```sql
-- 创建数据库
CREATE DATABASE stoma_care_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选，也可用root）
CREATE USER 'stoma_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON stoma_care_db.* TO 'stoma_user'@'localhost';
FLUSH PRIVILEGES;
```

### 步骤3：配置环境变量

在 `C:\www\backend\` 创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=stoma_user
DB_PASSWORD=your_password
DB_NAME=stoma_care_db

# JWT密钥（使用下面命令生成随机密钥）
JWT_SECRET=your_super_secret_key_change_this

# 微信小程序配置
WECHAT_APPID=wx61ba15d015833945
WECHAT_SECRET=39dcc9d80a1ccbc94142d96519efad07

# 服务器配置
PORT=3000
NODE_ENV=production
```

**生成安全的 JWT_SECRET：**

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤4：一键部署

打开 PowerShell 或 CMD，进入项目目录：

```powershell
cd C:\www\backend

# 运行部署脚本
deploy.bat init
```

部署脚本会自动：
- ✅ 检查依赖
- ✅ 安装 npm 包
- ✅ 创建必要目录
- ✅ 初始化数据库
- ✅ 启动 PM2 应用

### 步骤5：配置域名解析

在域名服务商（阿里云/腾讯云等）添加 A 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | api | 您的公网IP | 600 |

等待 5-10 分钟 DNS 生效。

### 步骤6：配置 IIS（可选，推荐）

如果想使用域名访问并配置 HTTPS：

#### 6.1 安装 IIS + URL Rewrite + ARR

1. 安装 IIS（服务器管理器 -> 添加角色和功能）
2. 下载安装：
   - **URL Rewrite**：https://www.iis.net/downloads/microsoft/url-rewrite
   - **ARR**：https://www.iis.net/downloads/microsoft/application-request-routing

#### 6.2 配置反向代理

1. 打开 IIS 管理器
2. 选择服务器节点 -> Application Request Routing -> Server Proxy Settings
3. 勾选 "Enable proxy" -> 应用

4. 创建网站：
   - 网站名称：`StomaCareAPI`
   - 物理路径：`C:\inetpub\wwwroot\api`（新建空文件夹）
   - 绑定：HTTP, 80端口, 主机名：`api.yourdomain.com`

5. 添加 URL Rewrite 规则：
   - 匹配URL：`(.*)`
   - 重写URL：`http://localhost:3000/{R:1}`

### 步骤7：配置 HTTPS

#### 获取 SSL 证书

**方式A：云服务商免费证书**（推荐）
- 阿里云/腾讯云控制台申请免费 DV 证书
- 下载 IIS 格式证书

**方式B：Let's Encrypt**
- 下载 win-acme：https://www.win-acme.com/
- 运行自动获取证书

#### 导入证书

1. 双击 `.pfx` 文件
2. 选择"本地计算机"
3. 按提示导入

#### 配置 HTTPS 绑定

1. IIS -> 选择网站 -> 绑定
2. 添加 HTTPS, 443端口
3. 选择证书

### 步骤8：配置防火墙

#### Windows 防火墙

```powershell
# 允许 HTTP (80)
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# 允许 HTTPS (443)
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

或通过图形界面：
- Windows Defender 防火墙 -> 高级设置
- 入站规则 -> 新建规则
- 端口 -> TCP -> 80, 443 -> 允许连接

#### 云服务器安全组

在云服务商控制台配置安全组，开放 80 和 443 端口。

### 步骤9：配置微信公众平台

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 开发 -> 开发管理 -> 开发设置 -> 服务器域名
3. 配置：
   - request合法域名：`https://api.yourdomain.com`
   - uploadFile合法域名：`https://api.yourdomain.com`
   - downloadFile合法域名：`https://api.yourdomain.com`

### 步骤10：更新小程序配置

修改小程序 `patientApp/config.js` 和 `nurseApp/config.js`：

```javascript
module.exports = {
  apiBaseUrl: 'https://api.yourdomain.com/api',
  uploadUrl: 'https://api.yourdomain.com/api/assessments/upload',
  timeout: 10000,
  version: '1.0.0'
}
```

---

## 🎉 部署完成！

### 验证部署

```powershell
# 测试本地 API
curl http://localhost:3000/api/health

# 测试域名（如果配置了 IIS）
curl https://api.yourdomain.com/api/health
```

应该看到：`{"status":"ok","message":"服务运行正常"}`

---

## 📋 常用命令

### 部署脚本命令

```powershell
deploy.bat init       # 初始化部署
deploy.bat update     # 更新代码
deploy.bat restart    # 重启服务
deploy.bat stop       # 停止服务
deploy.bat status     # 查看状态
deploy.bat logs       # 查看日志
deploy.bat backup     # 备份数据库
deploy.bat health     # 健康检查
deploy.bat help       # 查看帮助
```

### PM2 命令

```powershell
pm2 status                        # 查看状态
pm2 logs stoma-care-backend       # 查看日志
pm2 restart stoma-care-backend    # 重启
pm2 stop stoma-care-backend       # 停止
pm2 monit                         # 实时监控
```

---

## 🔧 日常维护

### 更新应用

```powershell
# 方式1：使用脚本
deploy.bat update

# 方式2：手动更新
pm2 stop stoma-care-backend
# 上传新代码
cd C:\www\backend
npm install --production
pm2 restart stoma-care-backend
```

### 备份数据库

```powershell
# 使用脚本
deploy.bat backup

# 或手动备份
mysqldump -u stoma_user -p stoma_care_db > C:\backups\backup.sql
```

### 查看日志

```powershell
# PM2 日志
pm2 logs

# 应用日志
type C:\www\backend\logs\out.log

# IIS 日志
type C:\inetpub\logs\LogFiles\W3SVC1\*.log
```

---

## ❓ 常见问题

### Q1: PM2 启动失败

```powershell
# 查看错误日志
pm2 logs --err

# 检查端口占用
netstat -ano | findstr :3000

# 重启 PM2
pm2 delete stoma-care-backend
pm2 start src/server.js --name stoma-care-backend
```

### Q2: 数据库连接失败

```powershell
# 检查 MySQL 服务
Get-Service MySQL*

# 启动 MySQL
Start-Service MySQL80

# 测试连接
mysql -u stoma_user -p
```

### Q3: IIS 502 错误

**检查清单：**
- [ ] Node.js 应用是否运行（`pm2 status`）
- [ ] ARR 是否启用
- [ ] URL Rewrite 规则是否正确
- [ ] 端口是否正确（3000）

### Q4: 无法访问域名

**检查清单：**
- [ ] DNS 是否解析正确（`nslookup api.yourdomain.com`）
- [ ] 防火墙是否开放 80/443 端口
- [ ] IIS 是否运行
- [ ] 域名绑定是否正确

### Q5: HTTPS 证书问题

**检查清单：**
- [ ] 证书是否正确导入
- [ ] HTTPS 绑定是否添加
- [ ] 证书是否过期
- [ ] 是否选择了正确的证书

---

## 🔐 安全建议

### 1. 强密码

- 使用强密码作为数据库密码
- JWT_SECRET 使用随机生成的长字符串
- Windows 管理员使用复杂密码

### 2. 定期备份

```powershell
# 创建自动备份任务
# 任务计划程序 -> 创建基本任务
# 每天凌晨 3 点运行：deploy.bat backup
```

### 3. 更新软件

```powershell
# 定期更新 npm 包
npm update
npm audit fix
```

### 4. 防火墙

只开放必要的端口：
- 80 (HTTP)
- 443 (HTTPS)
- 3389 (远程桌面)

---

## 📊 系统架构

```
微信小程序
    ↓ HTTPS
域名解析 (api.yourdomain.com)
    ↓
Windows 防火墙
    ↓
IIS (反向代理 + SSL)
    ↓
PM2 (进程管理)
    ↓
Node.js 应用 (端口 3000)
    ↓
MySQL 数据库
```

---

## 📚 相关文档

- 📖 [完整 Windows 部署指南](./WINDOWS部署指南.md) - 详细步骤
- 📡 [API 接口文档](./API.md) - API 说明
- 🔧 [安装指南](./INSTALL.md) - 本地开发

---

## ✅ 部署检查清单

部署完成后，请逐项确认：

- [ ] Node.js 应用运行正常（`pm2 status`）
- [ ] 数据库连接正常
- [ ] 本地可访问 `http://localhost:3000/api/health`
- [ ] 域名 DNS 解析正确
- [ ] IIS 反向代理配置正确
- [ ] HTTPS 证书配置完成
- [ ] 防火墙规则已添加
- [ ] 微信公众平台域名已配置
- [ ] 小程序配置已更新
- [ ] 自动备份已设置

---

## 🎯 下一步

部署完成后：

1. **监控应用**
   ```powershell
   pm2 monit
   ```

2. **设置自动备份**
   - 使用 Windows 任务计划程序
   - 每天自动运行 `deploy.bat backup`

3. **优化性能**
   - PM2 集群模式（多进程）
   - IIS 输出缓存
   - 数据库索引优化

4. **持续监控**
   - 定期查看日志
   - 监控服务器性能
   - 检查磁盘空间

---

恭喜您！Windows 服务器部署完成！🎉

如有问题，请参考 [WINDOWS部署指南.md](./WINDOWS部署指南.md) 或联系技术支持。


