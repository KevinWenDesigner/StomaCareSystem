# 护理教育模块 - 常见问题排查

## ❌ 错误：ECONNREFUSED

### 问题描述
运行 `npm run add-chapters` 时出现：
```
❌ 添加课程章节失败: 
Error: ECONNREFUSED
```

### 原因分析
- MySQL数据库服务未启动
- 数据库连接配置不正确
- 数据库不存在

---

## ✅ 解决方案

### 步骤1: 检查MySQL服务

#### Windows
```bash
# 检查MySQL服务状态
net start | findstr MySQL

# 如果没有运行，启动MySQL服务
net start MySQL80
# 或
net start MySQL
```

#### Mac
```bash
# 检查MySQL状态
brew services list | grep mysql

# 启动MySQL
brew services start mysql
# 或
mysql.server start
```

#### Linux
```bash
# 检查MySQL状态
sudo systemctl status mysql

# 启动MySQL
sudo systemctl start mysql
```

---

### 步骤2: 验证数据库连接

```bash
# 尝试连接MySQL
mysql -u root -p

# 成功连接后：
mysql> SHOW DATABASES;
mysql> USE stoma_care;
mysql> SHOW TABLES;
```

**如果连接失败：**
- 检查用户名和密码是否正确
- 确认MySQL端口（默认3306）

---

### 步骤3: 检查数据库配置

编辑 `backend/src/config/database.js`：

```javascript
module.exports = {
  host: 'localhost',      // ✅ 确认
  port: 3306,             // ✅ 确认端口号
  user: 'root',           // ✅ 确认用户名
  password: '你的密码',    // ✅ 检查密码
  database: 'stoma_care'  // ✅ 确认数据库名
};
```

**常见问题：**
- ❌ 密码错误
- ❌ 端口号错误（有的MySQL使用3307）
- ❌ 数据库名称拼写错误

---

### 步骤4: 初始化数据库（如果数据库不存在）

```bash
# 进入backend目录
cd backend

# 运行数据库初始化
npm run init-db
```

**预期输出：**
```
✅ 所有数据表创建成功
🎉 数据库初始化完成！
```

---

### 步骤5: 重新运行章节脚本

```bash
npm run add-chapters
```

**成功标志：**
```
🎉 课程章节功能添加完成！
```

---

## 🔍 详细诊断步骤

### 1. 测试数据库连接

创建测试文件 `test-db-connection.js`：

```javascript
const mysql = require('mysql2/promise');
const dbConfig = require('./src/config/database');

async function testConnection() {
  try {
    console.log('尝试连接数据库...');
    console.log('配置:', { ...dbConfig, password: '***' });
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！');
    
    const [rows] = await connection.query('SELECT DATABASE() as db');
    console.log('当前数据库:', rows[0].db);
    
    await connection.end();
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('错误代码:', error.code);
  }
}

testConnection();
```

运行测试：
```bash
node test-db-connection.js
```

---

### 2. 检查MySQL版本

```bash
mysql --version
```

**支持的版本：**
- MySQL 5.7+
- MySQL 8.0+ ✅ 推荐
- MariaDB 10.2+

---

### 3. 检查端口占用

```bash
# Windows
netstat -ano | findstr :3306

# Mac/Linux
lsof -i :3306
```

---

## 🛠️ 快速修复命令

### Windows快速启动MySQL

```cmd
# 以管理员身份运行命令提示符
net start MySQL80
```

### 重置MySQL密码（如果忘记密码）

```bash
# 1. 停止MySQL服务
net stop MySQL80

# 2. 以安全模式启动MySQL（跳过密码验证）
mysqld --skip-grant-tables

# 3. 在新的命令行窗口中
mysql -u root

# 4. 重置密码
mysql> FLUSH PRIVILEGES;
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
mysql> exit;

# 5. 重启MySQL服务
net stop MySQL80
net start MySQL80
```

---

## 📋 前置条件检查清单

在运行 `npm run add-chapters` 之前，确保：

- [ ] ✅ MySQL服务已启动
- [ ] ✅ 数据库配置正确（database.js）
- [ ] ✅ stoma_care数据库已创建
- [ ] ✅ 基础表已创建（运行过 init-db）
- [ ] ✅ 可以通过mysql命令连接

---

## 💡 其他常见问题

### Q1: MySQL2配置警告

```
Ignoring invalid configuration option passed to Connection: query
```

**说明：** 这是警告，不影响功能。是因为database.js导出的配置对象包含了一些方法。

**解决（可选）：**

修改 `backend/src/config/database.js`，分离配置和方法：

```javascript
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'stoma_care',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 导出纯配置对象用于createConnection
config.getConnectionConfig = function() {
  return {
    host: this.host,
    port: this.port,
    user: this.user,
    password: this.password,
    database: this.database
  };
};

module.exports = config;
```

然后在 `addCourseChapters.js` 中：

```javascript
const connection = await mysql.createConnection(dbConfig.getConnectionConfig 
  ? dbConfig.getConnectionConfig() 
  : dbConfig
);
```

---

### Q2: 表已存在错误

```
Error: Table 'course_chapters' already exists
```

**说明：** 表已经创建过了。

**解决：**
- 跳过这个错误，继续运行（脚本使用 IF NOT EXISTS）
- 或删除表重建：
  ```sql
  DROP TABLE IF EXISTS course_chapters;
  ```

---

### Q3: 外键约束错误

```
Error: Cannot add foreign key constraint
```

**原因：** courses表不存在或ID类型不匹配

**解决：**
```bash
# 先运行数据库初始化
npm run init-db

# 再运行章节脚本
npm run add-chapters
```

---

## 📞 仍然无法解决？

### 收集诊断信息

```bash
# 1. MySQL版本
mysql --version

# 2. 服务状态
net start | findstr MySQL  # Windows
brew services list | grep mysql  # Mac

# 3. 数据库列表
mysql -u root -p -e "SHOW DATABASES;"

# 4. Node.js版本
node --version

# 5. NPM版本
npm --version
```

将以上信息和完整错误日志一起提供，以便进一步诊断。

---

## ✅ 成功运行的标志

运行 `npm run add-chapters` 后应该看到：

```
============================================================
🚀 开始添加课程章节功能...

✅ 数据库连接成功

📝 创建课程章节表...
✅ 课程章节表创建成功

📚 插入课程章节数据...
✅ 课程章节数据插入成功

🔄 更新课程总时长...
✅ 课程总时长更新成功

============================================================
🎉 课程章节功能添加完成！

已添加的内容：
  - course_chapters 表（课程章节表）
  - 课程1（认识造口）：3个章节
  - 课程2（造口用品认知）：3个章节

📊 课程章节统计：
  认识造口：3个章节，总时长 20分钟
  造口用品认知：3个章节，总时长 21分钟
```

---

**文档版本**: 1.0.0  
**创建日期**: 2025-11-08

