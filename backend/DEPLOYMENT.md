# 造口护理系统后端 - 生产环境部署指南

## 📋 目录
- [服务器要求](#服务器要求)
- [部署前准备](#部署前准备)
- [步骤1：服务器环境搭建](#步骤1服务器环境搭建)
- [步骤2：安装必要软件](#步骤2安装必要软件)
- [步骤3：上传代码](#步骤3上传代码)
- [步骤4：配置数据库](#步骤4配置数据库)
- [步骤5：配置环境变量](#步骤5配置环境变量)
- [步骤6：使用PM2部署](#步骤6使用pm2部署)
- [步骤7：配置Nginx](#步骤7配置nginx)
- [步骤8：配置HTTPS](#步骤8配置https)
- [步骤9：微信小程序配置](#步骤9微信小程序配置)
- [维护与监控](#维护与监控)
- [常见问题](#常见问题)

---

## 服务器要求

### 最低配置
- **CPU**: 2核
- **内存**: 2GB
- **磁盘**: 40GB SSD
- **带宽**: 1Mbps
- **操作系统**: Ubuntu 20.04 LTS / CentOS 7+ / Debian 10+

### 推荐配置
- **CPU**: 4核
- **内存**: 4GB
- **磁盘**: 80GB SSD
- **带宽**: 5Mbps
- **操作系统**: Ubuntu 22.04 LTS

### 云服务器推荐
- 阿里云 ECS
- 腾讯云 CVM
- 华为云 ECS
- AWS EC2
- Azure VM

---

## 部署前准备

### 1. 准备工作清单
- [ ] 购买云服务器
- [ ] 注册域名（例如：api.yourdomain.com）
- [ ] 域名解析指向服务器IP
- [ ] 准备SSH客户端（Xshell、PuTTY、Windows Terminal等）
- [ ] 确保微信小程序 AppID 和 AppSecret

### 2. 安全组/防火墙配置
在云服务器控制台配置安全组，开放以下端口：
- **22**: SSH（管理用）
- **80**: HTTP
- **443**: HTTPS
- **3306**: MySQL（仅内网，不对外开放）

---

## 步骤1：服务器环境搭建

### 1.1 连接服务器

```bash
# 使用SSH连接（替换为您的服务器IP）
ssh root@your_server_ip

# 或使用密钥
ssh -i your_key.pem root@your_server_ip
```

### 1.2 更新系统

**Ubuntu/Debian:**
```bash
apt update && apt upgrade -y
```

**CentOS:**
```bash
yum update -y
```

### 1.3 创建部署用户（推荐）

```bash
# 创建新用户
adduser deploy

# 添加sudo权限
usermod -aG sudo deploy

# 切换到新用户
su - deploy
```

---

## 步骤2：安装必要软件

### 2.1 安装 Node.js (使用 nvm - 推荐)

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 加载 nvm
source ~/.bashrc

# 安装 Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# 验证安装
node -v
npm -v
```

**或直接安装 Node.js (Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2.2 安装 MySQL

**Ubuntu/Debian:**
```bash
# 安装 MySQL
sudo apt install -y mysql-server

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

**CentOS:**
```bash
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

### 2.3 安装 Nginx

**Ubuntu/Debian:**
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**CentOS:**
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.4 安装 PM2

```bash
npm install -g pm2
```

### 2.5 安装 Git

```bash
# Ubuntu/Debian
sudo apt install -y git

# CentOS
sudo yum install -y git
```

---

## 步骤3：上传代码

### 方式1：使用 Git（推荐）

```bash
# 进入项目目录
cd /home/deploy

# 克隆代码（如果使用Git仓库）
git clone https://github.com/yourusername/StomaCareSystem.git
cd StomaCareSystem/backend

# 或者使用私有仓库
git clone git@github.com:yourusername/StomaCareSystem.git
```

### 方式2：使用 SCP 上传

**在本地电脑上执行：**
```bash
# Windows PowerShell 或 Git Bash
cd D:\wk\Code\Cursor\2025\StomaCareSystem

# 打包后端代码
tar -czf backend.tar.gz backend/

# 上传到服务器
scp backend.tar.gz deploy@your_server_ip:/home/deploy/

# 连接服务器后解压
ssh deploy@your_server_ip
cd /home/deploy
tar -xzf backend.tar.gz
```

### 方式3：使用 FTP/SFTP 工具

使用 FileZilla、WinSCP 等工具上传 `backend` 目录。

---

## 步骤4：配置数据库

### 4.1 登录 MySQL

```bash
sudo mysql -u root -p
```

### 4.2 创建数据库和用户

```sql
-- 创建数据库
CREATE DATABASE stoma_care_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户
CREATE USER 'stoma_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

-- 授权
GRANT ALL PRIVILEGES ON stoma_care_db.* TO 'stoma_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 4.3 测试连接

```bash
mysql -u stoma_user -p stoma_care_db
```

---

## 步骤5：配置环境变量

### 5.1 创建 .env 文件

```bash
cd /home/deploy/backend
nano .env  # 或使用 vi .env
```

### 5.2 填写生产环境配置

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=stoma_user
DB_PASSWORD=your_strong_password_here
DB_NAME=stoma_care_db

# JWT密钥（使用强随机字符串）
JWT_SECRET=your_super_secret_key_12345678901234567890

# 微信小程序配置
WECHAT_APPID=wx61ba15d015833945
WECHAT_SECRET=39dcc9d80a1ccbc94142d96519efad07

# 服务器配置
PORT=3000
NODE_ENV=production

# 文件上传配置（可选）
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

**生成安全的 JWT_SECRET：**
```bash
# 生成32位随机字符串
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5.3 保护 .env 文件

```bash
chmod 600 .env
```

---

## 步骤6：使用PM2部署

### 6.1 安装依赖

```bash
cd /home/deploy/backend
npm install --production
```

### 6.2 初始化数据库

```bash
npm run init-db
```

### 6.3 创建 PM2 配置文件

```bash
nano ecosystem.config.js
```

**内容如下：**
```javascript
module.exports = {
  apps: [{
    name: 'stoma-care-backend',
    script: './src/server.js',
    instances: 2,  // 使用2个进程（根据CPU核心数调整）
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

### 6.4 创建日志目录

```bash
mkdir -p logs
```

### 6.5 启动应用

```bash
# 使用配置文件启动
pm2 start ecosystem.config.js

# 或直接启动
pm2 start src/server.js --name stoma-care-backend -i 2

# 查看状态
pm2 status

# 查看日志
pm2 logs stoma-care-backend

# 监控
pm2 monit
```

### 6.6 设置开机自启

```bash
# 生成启动脚本
pm2 startup

# 复制输出的命令并执行（会提示一个sudo命令）
# 例如：sudo env PATH=$PATH:/home/deploy/.nvm/versions/node/v18.x.x/bin ...

# 保存当前PM2配置
pm2 save
```

### 6.7 常用 PM2 命令

```bash
# 查看状态
pm2 status

# 重启应用
pm2 restart stoma-care-backend

# 停止应用
pm2 stop stoma-care-backend

# 删除应用
pm2 delete stoma-care-backend

# 查看日志
pm2 logs stoma-care-backend

# 清空日志
pm2 flush

# 实时监控
pm2 monit

# 查看详细信息
pm2 show stoma-care-backend
```

---

## 步骤7：配置Nginx

### 7.1 创建Nginx配置文件

```bash
sudo nano /etc/nginx/sites-available/stoma-care
```

**配置内容：**
```nginx
# HTTP配置（稍后会升级到HTTPS）
server {
    listen 80;
    server_name api.yourdomain.com;  # 替换为您的域名

    # 日志配置
    access_log /var/log/nginx/stoma-care-access.log;
    error_log /var/log/nginx/stoma-care-error.log;

    # 客户端最大上传大小
    client_max_body_size 10M;

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # 请求头设置
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件访问
    location /uploads {
        alias /home/deploy/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
```

### 7.2 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/stoma-care /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 7.3 验证

```bash
# 测试API
curl http://api.yourdomain.com/api/health
```

---

## 步骤8：配置HTTPS

### 8.1 安装 Certbot

**Ubuntu/Debian:**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

**CentOS:**
```bash
sudo yum install -y certbot python3-certbot-nginx
```

### 8.2 获取SSL证书

```bash
# 自动配置HTTPS
sudo certbot --nginx -d api.yourdomain.com

# 按提示输入邮箱并同意协议
```

### 8.3 自动续期

```bash
# 测试自动续期
sudo certbot renew --dry-run

# Certbot会自动添加cron任务，无需手动配置
```

### 8.4 更新后的Nginx配置

Certbot会自动修改配置，最终效果类似：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;  # 重定向到HTTPS
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL证书
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置同上...
    location /api {
        proxy_pass http://localhost:3000;
        # ... 省略其他配置
    }
}
```

---

## 步骤9：微信小程序配置

### 9.1 配置服务器域名

登录 [微信公众平台](https://mp.weixin.qq.com/)

1. 进入：**开发 > 开发管理 > 开发设置 > 服务器域名**

2. 配置以下域名：
   - **request合法域名**: `https://api.yourdomain.com`
   - **uploadFile合法域名**: `https://api.yourdomain.com`
   - **downloadFile合法域名**: `https://api.yourdomain.com`

3. 下载验证文件并上传到服务器：

```bash
# 创建验证文件目录
sudo mkdir -p /var/www/html/.well-known

# 上传微信验证文件到这个目录
# 然后在Nginx配置中添加：
location /.well-known {
    root /var/www/html;
}

# 重启Nginx
sudo nginx -s reload
```

### 9.2 更新小程序配置

修改小程序端配置文件：

**patientApp/config.js:**
```javascript
module.exports = {
  apiBaseUrl: 'https://api.yourdomain.com/api',
  uploadUrl: 'https://api.yourdomain.com/api/assessments/upload',
  timeout: 10000,
  version: '1.0.0'
}
```

---

## 维护与监控

### 日志管理

#### 查看应用日志
```bash
# PM2日志
pm2 logs stoma-care-backend

# 指定行数
pm2 logs stoma-care-backend --lines 100

# 实时查看
pm2 logs stoma-care-backend --raw
```

#### 查看Nginx日志
```bash
# 访问日志
sudo tail -f /var/log/nginx/stoma-care-access.log

# 错误日志
sudo tail -f /var/log/nginx/stoma-care-error.log
```

#### 日志轮转
```bash
# 配置PM2日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 性能监控

```bash
# 实时监控
pm2 monit

# 系统资源
htop

# 磁盘使用
df -h

# 内存使用
free -h
```

### 数据库备份

#### 创建备份脚本

```bash
nano ~/backup_db.sh
```

**内容：**
```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="stoma_care_db"
DB_USER="stoma_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# 压缩
gzip $BACKUP_DIR/db_backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

#### 设置定时备份

```bash
# 添加执行权限
chmod +x ~/backup_db.sh

# 添加cron任务（每天凌晨3点备份）
crontab -e

# 添加以下行：
0 3 * * * /home/deploy/backup_db.sh >> /home/deploy/backup.log 2>&1
```

### 系统更新

```bash
# 停止应用
pm2 stop stoma-care-backend

# 拉取最新代码
cd /home/deploy/backend
git pull

# 安装依赖
npm install --production

# 重启应用
pm2 restart stoma-care-backend

# 或使用零停机重启
pm2 reload stoma-care-backend
```

---

## 常见问题

### 1. 端口被占用

```bash
# 查看占用3000端口的进程
sudo lsof -i :3000

# 或
sudo netstat -tulpn | grep 3000

# 杀死进程
sudo kill -9 PID
```

### 2. MySQL 连接失败

```bash
# 检查MySQL状态
sudo systemctl status mysql

# 重启MySQL
sudo systemctl restart mysql

# 查看MySQL错误日志
sudo tail -f /var/log/mysql/error.log
```

### 3. Nginx 无法启动

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查端口占用
sudo lsof -i :80
sudo lsof -i :443
```

### 4. PM2 应用崩溃

```bash
# 查看日志
pm2 logs stoma-care-backend --err

# 查看详细信息
pm2 show stoma-care-backend

# 重启应用
pm2 restart stoma-care-backend
```

### 5. 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 清理PM2日志
pm2 flush

# 清理系统日志
sudo journalctl --vacuum-time=7d

# 清理npm缓存
npm cache clean --force
```

### 6. 文件上传失败

```bash
# 检查uploads目录权限
ls -la /home/deploy/backend/uploads

# 修改权限
chmod -R 755 /home/deploy/backend/uploads
chown -R deploy:deploy /home/deploy/backend/uploads
```

---

## 安全加固

### 1. 防火墙配置

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. 修改SSH端口（可选）

```bash
# 编辑SSH配置
sudo nano /etc/ssh/sshd_config

# 修改端口（例如改为2222）
Port 2222

# 重启SSH
sudo systemctl restart sshd

# 记得在防火墙开放新端口
sudo ufw allow 2222/tcp
```

### 3. 禁用root登录

```bash
# 编辑SSH配置
sudo nano /etc/ssh/sshd_config

# 设置
PermitRootLogin no

# 重启SSH
sudo systemctl restart sshd
```

### 4. 配置fail2ban

```bash
# 安装
sudo apt install fail2ban

# 启动
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 性能优化

### 1. Nginx 缓存配置

```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

# 在 location 块中使用
location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    # ... 其他配置
}
```

### 2. 启用Gzip压缩

```nginx
# 在 http 块中添加
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 3. 数据库优化

```sql
-- 为常用查询添加索引（已在初始化脚本中）
-- 定期优化表
OPTIMIZE TABLE users, patients, assessments;

-- 分析表
ANALYZE TABLE users, patients, assessments;
```

---

## 部署检查清单

部署完成后，请逐项检查：

- [ ] 服务器环境搭建完成
- [ ] Node.js、MySQL、Nginx 安装成功
- [ ] 代码上传到服务器
- [ ] 数据库创建并初始化
- [ ] .env 文件配置正确
- [ ] PM2 应用运行正常
- [ ] Nginx 反向代理配置成功
- [ ] HTTPS 证书配置成功
- [ ] 微信公众平台域名配置完成
- [ ] 小程序API地址更新为生产地址
- [ ] 数据库定时备份配置
- [ ] 日志轮转配置
- [ ] 防火墙配置
- [ ] 系统监控配置

---

## 测试验证

### 1. API测试

```bash
# 健康检查
curl https://api.yourdomain.com/api/health

# 应返回：
# {"status":"ok","message":"服务运行正常"}
```

### 2. 小程序测试

在微信开发者工具中：
1. 修改 API 地址为生产地址
2. 取消勾选"不校验合法域名"
3. 测试登录、数据获取等功能

---

## 技术支持

如遇到部署问题：

1. 查看应用日志：`pm2 logs`
2. 查看Nginx日志：`/var/log/nginx/`
3. 查看MySQL日志：`/var/log/mysql/`
4. 参考文档：`backend/API.md`、`backend/INSTALL.md`

---

## 总结

完成以上步骤后，您的后端服务将：

✅ 在生产服务器上稳定运行
✅ 通过HTTPS提供安全访问
✅ 使用PM2进行进程管理和自动重启
✅ 通过Nginx进行反向代理和负载均衡
✅ 微信小程序可正常调用API
✅ 数据定期自动备份

祝您部署顺利！🚀

