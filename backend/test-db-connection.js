// 详细的数据库连接测试
const mysql = require('mysql2/promise');

// 直接使用配置（不依赖.env）
const dbConfig = {
  host: '192.168.20.91',
  port: 3306,
  user: 'root',
  password: 'root',
  timezone: '+08:00'
};

async function testConnection() {
  console.log('========================================');
  console.log('数据库连接测试');
  console.log('========================================\n');
  
  console.log('配置信息:');
  console.log(`  主机: ${dbConfig.host}`);
  console.log(`  端口: ${dbConfig.port}`);
  console.log(`  用户: ${dbConfig.user}`);
  console.log(`  密码: ${'*'.repeat(dbConfig.password.length)}\n`);
  
  let connection;
  
  try {
    console.log('步骤1: 尝试连接到MySQL服务器...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 成功连接到MySQL服务器！\n');
    
    // 检查是否有数据库
    console.log('步骤2: 检查数据库是否存在...');
    const [databases] = await connection.query(
      "SHOW DATABASES LIKE 'stoma_care_db'"
    );
    
    if (databases.length > 0) {
      console.log('✅ 数据库 stoma_care_db 已存在\n');
      
      // 尝试使用该数据库
      console.log('步骤3: 尝试使用数据库...');
      await connection.query('USE stoma_care_db');
      console.log('✅ 成功切换到 stoma_care_db\n');
      
      // 检查表
      console.log('步骤4: 检查数据表...');
      const [tables] = await connection.query('SHOW TABLES');
      
      if (tables.length > 0) {
        console.log(`✅ 找到 ${tables.length} 个数据表:`);
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`   - ${tableName}`);
        });
        console.log('\n🎉 数据库已完整初始化，可以直接启动服务！');
      } else {
        console.log('⚠️  数据库存在但没有表，需要运行初始化脚本');
        console.log('\n📝 解决方法: 运行 npm run init-db');
      }
    } else {
      console.log('⚠️  数据库 stoma_care_db 不存在\n');
      
      console.log('步骤3: 尝试创建数据库...');
      await connection.query(
        "CREATE DATABASE stoma_care_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
      );
      console.log('✅ 数据库创建成功！\n');
      console.log('📝 下一步: 运行 npm run init-db 初始化数据表');
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n可能的原因:');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  1. 用户名或密码错误');
      console.error('  2. 该用户没有远程访问权限');
      console.error('\n解决方法:');
      console.error('  在MySQL服务器上执行:');
      console.error("  GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'root';");
      console.error('  FLUSH PRIVILEGES;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('  1. MySQL服务未启动');
      console.error('  2. 防火墙阻止了连接');
      console.error('  3. MySQL未配置监听该端口');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('  1. 网络连接超时');
      console.error('  2. 服务器地址不正确');
    } else {
      console.error('  未知错误，错误代码:', error.code);
    }
    
    console.error('\n错误详情:');
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n========================================');
      console.log('连接已关闭');
      console.log('========================================');
    }
    process.exit(0);
  }
}

testConnection();




