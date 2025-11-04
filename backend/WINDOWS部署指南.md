# Windows服务器部署指南

## 📋 目录
- [前置条件](#前置条件)
- [步骤1：安装必要软件](#步骤1安装必要软件)
- [步骤2：配置域名解析](#步骤2配置域名解析)
- [步骤3：上传代码](#步骤3上传代码)
- [步骤4：配置数据库](#步骤4配置数据库)
- [步骤5：配置环境变量](#步骤5配置环境变量)
- [步骤6：启动应用](#步骤6启动应用)
- [步骤7：配置IIS反向代理](#步骤7配置iis反向代理)
- [步骤8：配置HTTPS](#步骤8配置https)
- [步骤9：配置防火墙](#步骤9配置防火墙)
- [步骤10：微信小程序配置](#步骤10微信小程序配置)
- [维护与监控](#维护与监控)

---

## 前置条件

### 您已拥有
- ✅ Windows Server（推荐 Windows Server 2019/2022）
- ✅ 公网 IP 地址
- ✅ 已注册的域名（例如：api.yourdomain.com）

### 服务器推荐配置
- **CPU**: 2核或以上
- **内存**: 4GB 或以上
- **磁盘**: 60GB 或以上
- **网络**: 有公网IP，可远程访问

---

## 步骤1：安装必要软件

### 1.1 安装 Node.js

1. 下载 Node.js LTS 版本：https://nodejs.org/
2. 选择 Windows Installer (.msi) 64位版本
3. 双击安装，一路 Next，勾选 "Add to PATH"
4. 验证安装：

```powershell
# 打开 PowerShell 或 CMD
node -v
npm -v
```

### 1.2 安装 MySQL

**方式A：使用 MySQL Installer（推荐）**

1. 下载：https://dev.mysql.com/downloads/installer/
2. 选择 `mysql-installer-community-8.x.x.msi`
3. 安装类型选择：`Developer Default` 或 `Server only`
4. 设置 root 密码（记住这个密码！）
5. 配置 MySQL 为 Windows 服务，开机自启

**验证安装：**

```powershell
# 测试 MySQL 命令
mysql -u root -p
# 输入密码后应该能进入 MySQL
```

### 1.3 安装 PM2

```powershell
# 全局安装 PM2
npm install -g pm2

# Windows 需要额外安装 pm2-windows-service
npm install -g pm2-windows-service

# 验证
pm2 -v
```

### 1.4 安装 Git（可选）

下载：https://git-scm.com/download/win
- 安装时选择默认选项即可

---

## 步骤2：配置域名解析

### 2.1 登录域名服务商（阿里云/腾讯云/GoDaddy等）

### 2.2 添加 DNS 解析记录

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | api | 您的公网IP | 600 |

**示例：**
- 如果您的域名是 `yourdomain.com`
- 公网IP是 `123.45.67.89`
- 那么解析后访问地址是：`http://api.yourdomain.com`

### 2.3 等待DNS生效（通常5-10分钟）

```powershell
# 验证DNS解析
nslookup api.yourdomain.com
# 应该看到您的公网IP
```

---

## 步骤3：上传代码

### 方式A：使用远程桌面直接复制

1. 远程桌面连接到 Windows 服务器
2. 在本地电脑上复制 `backend` 文件夹
3. 在远程桌面中粘贴到服务器（例如：`C:\www\backend`）

### 方式B：使用 Git 克隆

```powershell
# 创建项目目录
mkdir C:\www
cd C:\www

# 克隆代码
git clone your-repository-url

# 或者只克隆 backend
```

### 方式C：使用 FTP/SFTP 工具

使用 FileZilla、WinSCP 等工具上传 `backend` 文件夹

**推荐目录结构：**
```
C:\www\
  └─ backend\
      ├─ src\
      ├─ node_modules\
      ├─ package.json
      └─ .env
```

---

## 步骤4：配置数据库

### 4.1 打开 MySQL 命令行

```powershell
# 方式1：使用命令行
mysql -u root -p

# 方式2：使用 MySQL Workbench（图形化工具）
```

### 4.2 创建数据库和用户

```sql
-- 创建数据库
CREATE DATABASE stoma_care_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（可选，也可以直接用root）
CREATE USER 'stoma_user'@'localhost' IDENTIFIED BY 'your_strong_password';

-- 授权
GRANT ALL PRIVILEGES ON stoma_care_db.* TO 'stoma_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 4.3 测试连接

```powershell
mysql -u stoma_user -p stoma_care_db
```

---

## 步骤5：配置环境变量

### 5.1 创建 .env 文件

在 `C:\www\backend\` 目录下创建 `.env` 文件（注意文件名以点开头）

**使用记事本创建：**
1. 打开记事本
2. 复制下面的配置内容
3. 另存为 `C:\www\backend\.env`（注意选择"所有文件"类型）

**内容：**

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=stoma_user
DB_PASSWORD=your_strong_password
DB_NAME=stoma_care_db

# JWT密钥（请修改为随机字符串）
JWT_SECRET=your_super_secret_key_change_this_in_production

# 微信小程序配置
WECHAT_APPID=wx61ba15d015833945
WECHAT_SECRET=39dcc9d80a1ccbc94142d96519efad07

# 服务器配置
PORT=3000
NODE_ENV=production

# 文件上传配置
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

**生成安全的 JWT_SECRET：**

```powershell
# 在 PowerShell 中执行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 步骤6：启动应用

### 6.1 安装依赖

```powershell
# 进入项目目录
cd C:\www\backend

# 安装依赖
npm install --production
```

### 6.2 初始化数据库

```powershell
npm run init-db
```

### 6.3 测试启动

```powershell
# 测试启动（Ctrl+C 停止）
node src/server.js
```

如果看到 "服务器运行在端口 3000" 说明成功！

### 6.4 使用 PM2 守护进程

```powershell
# 启动应用
pm2 start src/server.js --name stoma-care-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 保存配置
pm2 save

# 设置 PM2 开机自启
pm2-startup install
```

**PM2 作为 Windows 服务运行：**

```powershell
# 安装 PM2 Windows 服务
pm2-service-install

# 启动服务
pm2-service-start

# 以后系统重启后 PM2 会自动启动
```

---

## 步骤7：配置IIS反向代理

### 方式A：使用 IIS + ARR（推荐用于生产环境）

#### 7.1 安装 IIS

1. 打开"服务器管理器"
2. 点击"添加角色和功能"
3. 选择"Web服务器(IIS)"
4. 完成安装

#### 7.2 安装 URL Rewrite 和 ARR

1. 下载并安装 **URL Rewrite**：
   https://www.iis.net/downloads/microsoft/url-rewrite

2. 下载并安装 **Application Request Routing (ARR)**：
   https://www.iis.net/downloads/microsoft/application-request-routing

#### 7.3 启用 ARR 代理

1. 打开 IIS 管理器
2. 选择服务器节点
3. 双击"Application Request Routing Cache"
4. 右侧点击"Server Proxy Settings"
5. 勾选"Enable proxy"，点击"应用"

#### 7.4 创建网站

1. 在 IIS 中右键"网站" -> "添加网站"
2. 配置：
   - 网站名称：`StomaCareAPI`
   - 物理路径：`C:\inetpub\wwwroot\api`（创建这个空文件夹）
   - 绑定：
     - 类型：http
     - IP地址：全部未分配
     - 端口：80
     - 主机名：`api.yourdomain.com`

#### 7.5 配置 URL Rewrite 规则

1. 在 IIS 中选择刚创建的网站
2. 双击"URL 重写"
3. 右侧点击"添加规则" -> "空白规则"
4. 配置如下：

**名称**：`Reverse Proxy to Node.js`

**匹配 URL**：
- 请求的URL：匹配模式
- 使用：正则表达式
- 模式：`(.*)`

**条件**：（无需添加）

**操作**：
- 操作类型：重写
- 重写URL：`http://localhost:3000/{R:1}`
- 勾选"停止处理后续规则"

5. 点击"应用"

#### 7.6 配置 web.config（备选方法）

在 `C:\inetpub\wwwroot\api\` 创建 `web.config`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
          <serverVariables>
            <set name="HTTP_X_ORIGINAL_HOST" value="{HTTP_HOST}" />
          </serverVariables>
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### 方式B：直接使用 Node.js（简单但不推荐生产环境）

如果不想配置 IIS，可以：

1. 修改 `.env` 中的 `PORT=80`（需要管理员权限）
2. 配置 Windows 防火墙允许 80 端口
3. 直接访问 `http://api.yourdomain.com/api/health`

**注意**：这种方式无法配置 HTTPS，不适合生产环境。

---

## 步骤8：配置HTTPS

### 8.1 获取SSL证书

#### 方式A：使用云服务商免费证书（推荐）

如果您的域名在阿里云/腾讯云：

1. 登录云服务商控制台
2. 找到"SSL证书" -> "免费证书"
3. 申请免费证书（DV证书，免费1年）
4. 下载证书（选择IIS格式）

#### 方式B：使用 Let's Encrypt（免费，自动续期）

1. 下载 win-acme：https://www.win-acme.com/
2. 解压到 `C:\win-acme\`
3. 运行 `wacs.exe`
4. 按提示创建证书

### 8.2 在IIS中安装证书

1. 下载证书后，通常包含 `.pfx` 文件
2. 双击 `.pfx` 文件，选择"本地计算机"
3. 按提示导入证书到"个人"存储

或者在 IIS 中：

1. 打开 IIS 管理器
2. 选择服务器节点
3. 双击"服务器证书"
4. 右侧点击"导入"
5. 选择 `.pfx` 文件，输入密码

### 8.3 配置 HTTPS 绑定

1. 在 IIS 中选择您的网站
2. 右侧点击"绑定"
3. 点击"添加"
4. 配置：
   - 类型：https
   - IP地址：全部未分配
   - 端口：443
   - 主机名：`api.yourdomain.com`
   - SSL证书：选择刚才导入的证书
5. 点击"确定"

### 8.4 强制 HTTPS

在 URL Rewrite 中添加 HTTP 到 HTTPS 重定向规则：

```xml
<rule name="Redirect to HTTPS" stopProcessing="true">
  <match url="(.*)" />
  <conditions>
    <add input="{HTTPS}" pattern="off" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
</rule>
```

---

## 步骤9：配置防火墙

### 9.1 Windows 防火墙

1. 打开"Windows Defender 防火墙"
2. 点击"高级设置"
3. 入站规则 -> 新建规则

**添加以下规则：**

**规则1：HTTP（80端口）**
- 规则类型：端口
- 协议和端口：TCP，特定本地端口：80
- 操作：允许连接
- 配置文件：全选
- 名称：HTTP

**规则2：HTTPS（443端口）**
- 规则类型：端口
- 协议和端口：TCP，特定本地端口：443
- 操作：允许连接
- 配置文件：全选
- 名称：HTTPS

### 9.2 云服务器安全组

如果使用阿里云/腾讯云等，还需要在云控制台配置安全组：

1. 登录云服务器控制台
2. 找到您的服务器实例
3. 配置安全组规则
4. 添加入站规则：
   - 端口 80（HTTP）
   - 端口 443（HTTPS）
   - 来源：0.0.0.0/0

---

## 步骤10：微信小程序配置

### 10.1 配置微信公众平台

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入：**开发 > 开发管理 > 开发设置 > 服务器域名**
3. 配置以下域名（必须是HTTPS）：
   - **request合法域名**：`https://api.yourdomain.com`
   - **uploadFile合法域名**：`https://api.yourdomain.com`
   - **downloadFile合法域名**：`https://api.yourdomain.com`

### 10.2 下载并上传域名验证文件

1. 微信会提供一个验证文件（如 `MP_verify_xxx.txt`）
2. 将文件放到 `C:\inetpub\wwwroot\api\` 目录
3. 确保可以通过 `https://api.yourdomain.com/MP_verify_xxx.txt` 访问

### 10.3 更新小程序配置

修改 `patientApp/config.js` 和 `nurseApp/config.js`：

```javascript
module.exports = {
  // 使用您的域名
  apiBaseUrl: 'https://api.yourdomain.com/api',
  uploadUrl: 'https://api.yourdomain.com/api/assessments/upload',
  timeout: 10000,
  version: '1.0.0'
}
```

---

## 维护与监控

### 日常维护命令

```powershell
# 查看应用状态
pm2 status

# 查看日志
pm2 logs stoma-care-backend

# 重启应用
pm2 restart stoma-care-backend

# 停止应用
pm2 stop stoma-care-backend

# 查看实时监控
pm2 monit
```

### 更新应用

```powershell
# 1. 停止应用
pm2 stop stoma-care-backend

# 2. 备份数据库
# 在 MySQL Workbench 中导出数据

# 3. 上传新代码（覆盖旧文件）

# 4. 安装新依赖
cd C:\www\backend
npm install --production

# 5. 重启应用
pm2 restart stoma-care-backend
```

### 数据库备份

#### 使用命令行备份

```powershell
# 创建备份目录
mkdir C:\backups

# 备份数据库
mysqldump -u stoma_user -p stoma_care_db > C:\backups\backup_%date:~0,4%%date:~5,2%%date:~8,2%.sql
```

#### 使用 MySQL Workbench（图形化）

1. 打开 MySQL Workbench
2. Data Export -> 选择数据库
3. 选择导出路径
4. Start Export

#### 设置自动备份（Windows 任务计划程序）

1. 创建备份脚本 `C:\backups\backup.bat`：

```batch
@echo off
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%
mysqldump -u stoma_user -pyour_password stoma_care_db > C:\backups\db_%TIMESTAMP%.sql
forfiles /p "C:\backups" /m *.sql /d -7 /c "cmd /c del @path"
```

2. 打开"任务计划程序"
3. 创建基本任务
4. 触发器：每天凌晨3点
5. 操作：启动程序 `C:\backups\backup.bat`

### 查看日志

#### PM2 日志

```powershell
# 实时日志
pm2 logs

# 错误日志
pm2 logs --err

# 清空日志
pm2 flush
```

#### IIS 日志

位置：`C:\inetpub\logs\LogFiles\`

#### 应用日志

位置：`C:\www\backend\logs\`

---

## 🧪 测试验证

### 1. 本地测试

```powershell
# 测试 Node.js 应用
curl http://localhost:3000/api/health
```

### 2. 通过域名测试

```powershell
# 测试 HTTP
curl http://api.yourdomain.com/api/health

# 测试 HTTPS
curl https://api.yourdomain.com/api/health
```

### 3. 小程序测试

在微信开发者工具中：
1. 更新 `config.js` 的 API 地址
2. 取消勾选"不校验合法域名"
3. 测试登录功能
4. 测试数据获取

---

## ❓ 常见问题

### Q1: PM2 启动失败

```powershell
# 查看详细错误
pm2 logs --err

# 检查 .env 文件是否存在
dir .env

# 检查 Node.js 版本
node -v  # 应该 >= 14
```

### Q2: 数据库连接失败

```powershell
# 检查 MySQL 服务
Get-Service MySQL*

# 如果未运行，启动服务
Start-Service MySQL80  # 服务名可能不同

# 测试连接
mysql -u root -p
```

### Q3: IIS 502 错误

**可能原因**：
- Node.js 应用未启动
- 端口配置错误
- ARR 未启用

**解决方案**：
```powershell
# 检查应用状态
pm2 status

# 重启应用
pm2 restart stoma-care-backend

# 检查 IIS ARR 是否启用
```

### Q4: HTTPS 证书问题

**检查清单**：
- [ ] 证书已正确导入到 IIS
- [ ] HTTPS 绑定已添加
- [ ] 证书未过期
- [ ] 防火墙已开放 443 端口

### Q5: 微信域名配置失败

**确认**：
- [ ] 域名已正确解析
- [ ] 使用的是 HTTPS（不是 HTTP）
- [ ] 验证文件可访问
- [ ] 证书有效

---

## 🔐 安全建议

### 1. 使用强密码

- MySQL 密码
- .env 中的 JWT_SECRET
- Windows 管理员密码

### 2. 定期更新

```powershell
# 更新 Node.js 包
npm update

# 检查安全漏洞
npm audit
npm audit fix
```

### 3. 限制访问

- 只开放必要的端口（80、443）
- 使用防火墙规则
- 定期检查安全日志

### 4. 备份数据

- 每天自动备份数据库
- 定期备份代码
- 保留至少7天的备份

---

## 📊 性能优化

### 1. PM2 集群模式

```powershell
# 使用多进程（根据CPU核心数）
pm2 start src/server.js -i 2 --name stoma-care-backend
```

### 2. IIS 缓存

在 IIS 中配置输出缓存和压缩。

### 3. MySQL 优化

```sql
-- 添加索引（已在初始化脚本中）
-- 定期优化表
OPTIMIZE TABLE users, patients, assessments;
```

---

## ✅ 部署检查清单

- [ ] Node.js 已安装（v14+）
- [ ] MySQL 已安装并运行
- [ ] PM2 已安装
- [ ] 代码已上传到服务器
- [ ] .env 文件已配置
- [ ] 数据库已创建并初始化
- [ ] PM2 应用运行正常
- [ ] IIS 已安装并配置
- [ ] 域名已解析
- [ ] SSL 证书已配置
- [ ] HTTPS 可正常访问
- [ ] 防火墙规则已添加
- [ ] 微信公众平台域名已配置
- [ ] 小程序配置已更新
- [ ] 自动备份已设置

---

## 🎉 完成！

部署完成后，您的系统架构如下：

```
微信小程序
    ↓ HTTPS
域名 (api.yourdomain.com)
    ↓
IIS (反向代理 + SSL)
    ↓
PM2 (进程管理)
    ↓
Node.js 应用 (端口 3000)
    ↓
MySQL 数据库
```

现在您可以：
- ✅ 通过 HTTPS 访问 API
- ✅ 小程序可以正常调用后端
- ✅ 系统稳定运行
- ✅ 自动备份数据

如有问题，请参考本文档或联系技术支持！🚀


