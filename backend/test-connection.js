// 快速测试数据库连接
require('dotenv').config();
const db = require('./src/config/database');

async function testConnection() {
  console.log('测试数据库连接...\n');
  
  console.log('配置信息:');
  console.log(`- 主机: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`- 端口: ${process.env.DB_PORT || 3306}`);
  console.log(`- 用户: ${process.env.DB_USER || 'root'}`);
  console.log(`- 数据库: ${process.env.DB_NAME || 'stoma_care_db'}\n`);
  
  try {
    const connected = await db.testConnection();
    
    if (connected) {
      console.log('✅ 数据库连接测试成功！\n');
      
      // 测试查询
      console.log('执行测试查询...');
      const result = await db.query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ 用户表查询成功，当前用户数: ${result[0].count}\n`);
      
      console.log('🎉 所有测试通过！可以启动服务了。');
    } else {
      console.log('❌ 数据库连接失败！');
      console.log('\n请检查：');
      console.log('1. MySQL服务是否已启动');
      console.log('2. .env文件中的数据库配置是否正确');
      console.log('3. 数据库是否已创建（运行 npm run init-db）');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n如果数据库不存在，请先运行: npm run init-db');
  } finally {
    process.exit(0);
  }
}

testConnection();


