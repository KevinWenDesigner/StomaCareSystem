const mysql = require('mysql2/promise');
require('dotenv').config();

// 插入测试数据脚本
async function insertTestData() {
  let connection;
  
  try {
    console.log('🚀 开始插入测试数据...\n');
    
    // 创建连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'stoma_care_db',
      timezone: '+08:00'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 检查是否有患者数据
    const [patients] = await connection.query('SELECT id FROM patients LIMIT 1');
    
    if (patients.length === 0) {
      console.log('⚠️  没有找到患者数据，需要先创建患者');
      console.log('📝 创建测试用户和患者...\n');
      
      // 创建测试用户
      const [userResult] = await connection.query(`
        INSERT INTO users (openid, nickname, avatar_url, gender, user_type)
        VALUES ('test_openid_001', '测试患者', 'https://example.com/avatar.jpg', 1, 'patient')
        ON DUPLICATE KEY UPDATE openid=openid
      `);
      
      const userId = userResult.insertId || (await connection.query(
        'SELECT id FROM users WHERE openid = "test_openid_001"'
      ))[0][0].id;
      
      // 创建测试患者
      await connection.query(`
        INSERT INTO patients (user_id, name, gender, phone, stoma_type, surgery_date, status)
        VALUES (?, '张三', 'male', '13800138000', '结肠造口', '2024-01-15', 'active')
        ON DUPLICATE KEY UPDATE user_id=user_id
      `, [userId]);
      
      console.log('✅ 测试用户和患者创建成功\n');
    }
    
    // 获取第一个患者ID
    const [patientData] = await connection.query('SELECT id FROM patients LIMIT 1');
    const patientId = patientData[0].id;
    
    console.log(`📌 使用患者ID: ${patientId}\n`);
    
    // 检查是否已有学习记录
    const [existingRecords] = await connection.query(
      'SELECT COUNT(*) as count FROM learning_records WHERE patient_id = ?',
      [patientId]
    );
    
    if (existingRecords[0].count > 0) {
      console.log('⚠️  该患者已有学习记录，跳过插入');
      console.log(`   当前记录数: ${existingRecords[0].count}\n`);
    } else {
      console.log('📝 插入学习记录示例数据...\n');
      
      // 插入学习记录
      await connection.query(`
        INSERT INTO learning_records 
        (patient_id, course_id, progress, completed, last_position, study_duration, last_study_at)
        VALUES
        (?, 1, 100, 1, 0, 1800, DATE_SUB(NOW(), INTERVAL 2 DAY)),
        (?, 2, 75, 0, 0, 1350, DATE_SUB(NOW(), INTERVAL 1 DAY)),
        (?, 3, 50, 0, 0, 900, NOW()),
        (?, 4, 25, 0, 0, 450, DATE_SUB(NOW(), INTERVAL 3 HOUR))
      `, [patientId, patientId, patientId, patientId]);
      
      console.log('✅ 学习记录插入成功\n');
    }
    
    // 显示插入的数据
    const [records] = await connection.query(`
      SELECT 
        lr.id,
        lr.patient_id,
        c.title as course_title,
        lr.progress,
        lr.completed,
        lr.study_duration,
        lr.last_study_at
      FROM learning_records lr
      LEFT JOIN courses c ON lr.course_id = c.id
      WHERE lr.patient_id = ?
      ORDER BY lr.last_study_at DESC
    `, [patientId]);
    
    console.log('📊 当前学习记录:\n');
    console.table(records);
    
    // 显示统计信息
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_courses,
        SUM(completed) as completed_courses,
        SUM(study_duration) as total_duration
      FROM learning_records
      WHERE patient_id = ?
    `, [patientId]);
    
    console.log('\n📈 学习统计:\n');
    console.log(`  总课程数: ${stats[0].total_courses}`);
    console.log(`  已完成: ${stats[0].completed_courses}`);
    console.log(`  总学习时长: ${Math.round(stats[0].total_duration / 60)} 分钟`);
    
    console.log('\n🎉 测试数据插入完成！\n');
    
  } catch (error) {
    console.error('❌ 插入测试数据失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行插入
if (require.main === module) {
  insertTestData();
}

module.exports = insertTestData;


require('dotenv').config();

// 插入测试数据脚本
async function insertTestData() {
  let connection;
  
  try {
    console.log('🚀 开始插入测试数据...\n');
    
    // 创建连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'stoma_care_db',
      timezone: '+08:00'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 检查是否有患者数据
    const [patients] = await connection.query('SELECT id FROM patients LIMIT 1');
    
    if (patients.length === 0) {
      console.log('⚠️  没有找到患者数据，需要先创建患者');
      console.log('📝 创建测试用户和患者...\n');
      
      // 创建测试用户
      const [userResult] = await connection.query(`
        INSERT INTO users (openid, nickname, avatar_url, gender, user_type)
        VALUES ('test_openid_001', '测试患者', 'https://example.com/avatar.jpg', 1, 'patient')
        ON DUPLICATE KEY UPDATE openid=openid
      `);
      
      const userId = userResult.insertId || (await connection.query(
        'SELECT id FROM users WHERE openid = "test_openid_001"'
      ))[0][0].id;
      
      // 创建测试患者
      await connection.query(`
        INSERT INTO patients (user_id, name, gender, phone, stoma_type, surgery_date, status)
        VALUES (?, '张三', 'male', '13800138000', '结肠造口', '2024-01-15', 'active')
        ON DUPLICATE KEY UPDATE user_id=user_id
      `, [userId]);
      
      console.log('✅ 测试用户和患者创建成功\n');
    }
    
    // 获取第一个患者ID
    const [patientData] = await connection.query('SELECT id FROM patients LIMIT 1');
    const patientId = patientData[0].id;
    
    console.log(`📌 使用患者ID: ${patientId}\n`);
    
    // 检查是否已有学习记录
    const [existingRecords] = await connection.query(
      'SELECT COUNT(*) as count FROM learning_records WHERE patient_id = ?',
      [patientId]
    );
    
    if (existingRecords[0].count > 0) {
      console.log('⚠️  该患者已有学习记录，跳过插入');
      console.log(`   当前记录数: ${existingRecords[0].count}\n`);
    } else {
      console.log('📝 插入学习记录示例数据...\n');
      
      // 插入学习记录
      await connection.query(`
        INSERT INTO learning_records 
        (patient_id, course_id, progress, completed, last_position, study_duration, last_study_at)
        VALUES
        (?, 1, 100, 1, 0, 1800, DATE_SUB(NOW(), INTERVAL 2 DAY)),
        (?, 2, 75, 0, 0, 1350, DATE_SUB(NOW(), INTERVAL 1 DAY)),
        (?, 3, 50, 0, 0, 900, NOW()),
        (?, 4, 25, 0, 0, 450, DATE_SUB(NOW(), INTERVAL 3 HOUR))
      `, [patientId, patientId, patientId, patientId]);
      
      console.log('✅ 学习记录插入成功\n');
    }
    
    // 显示插入的数据
    const [records] = await connection.query(`
      SELECT 
        lr.id,
        lr.patient_id,
        c.title as course_title,
        lr.progress,
        lr.completed,
        lr.study_duration,
        lr.last_study_at
      FROM learning_records lr
      LEFT JOIN courses c ON lr.course_id = c.id
      WHERE lr.patient_id = ?
      ORDER BY lr.last_study_at DESC
    `, [patientId]);
    
    console.log('📊 当前学习记录:\n');
    console.table(records);
    
    // 显示统计信息
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_courses,
        SUM(completed) as completed_courses,
        SUM(study_duration) as total_duration
      FROM learning_records
      WHERE patient_id = ?
    `, [patientId]);
    
    console.log('\n📈 学习统计:\n');
    console.log(`  总课程数: ${stats[0].total_courses}`);
    console.log(`  已完成: ${stats[0].completed_courses}`);
    console.log(`  总学习时长: ${Math.round(stats[0].total_duration / 60)} 分钟`);
    
    console.log('\n🎉 测试数据插入完成！\n');
    
  } catch (error) {
    console.error('❌ 插入测试数据失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行插入
if (require.main === module) {
  insertTestData();
}

module.exports = insertTestData;

