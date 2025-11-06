const db = require('../config/database');

async function insertTestNurse() {
  try {
    console.log('开始插入测试护士数据...');
    
    // 首先需要创建对应的user记录
    // 检查是否已经有测试护士
    const existing = await db.query(
      "SELECT * FROM nurses WHERE phone = '13800138000' OR employee_id = 'N001'"
    );
    
    if (existing && existing.length > 0) {
      console.log('✓ 测试护士账号已存在:');
      console.table(existing);
      console.log('\n测试登录信息:');
      console.log('用户名: 13800138000 (或 N001)');
      console.log('密码: 任意密码 (当前为测试模式)');
      console.log('用户类型: nurse');
      return;
    }
    
    // 先创建微信用户（模拟）
    const testUsers = [
      { openid: 'test_nurse_001', nickname: 'test', user_type: 'nurse' },
      { openid: 'test_nurse_002', nickname: '张护士', user_type: 'nurse' },
      { openid: 'test_nurse_003', nickname: '李护士', user_type: 'nurse' }
    ];
    
    const userIds = [];
    for (const user of testUsers) {
      const result = await db.query(
        `INSERT INTO users (openid, nickname, user_type) VALUES (?, ?, ?)`,
        [user.openid, user.nickname, user.user_type]
      );
      userIds.push(result.insertId);
      console.log(`✓ 创建用户: ${user.nickname} (ID: ${result.insertId})`);
    }
    
    // 然后创建护士记录
    const nurses = [
      {
        user_id: userIds[0],
        name: 'test',
        phone: '13800138000',
        employee_id: 'N001',
        department: '造口护理科',
        title: '护士',
        hospital: '测试医院',
        status: 'active'
      },
      {
        user_id: userIds[1],
        name: '张护士',
        phone: '13800138001',
        employee_id: 'N002',
        department: '造口护理科',
        title: '护士长',
        hospital: '测试医院',
        status: 'active'
      },
      {
        user_id: userIds[2],
        name: '李护士',
        phone: '13800138002',
        employee_id: 'N003',
        department: '造口护理科',
        title: '护士',
        hospital: '测试医院',
        status: 'active'
      }
    ];
    
    for (const nurse of nurses) {
      const result = await db.query(
        `INSERT INTO nurses (user_id, name, phone, employee_id, department, title, hospital, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [nurse.user_id, nurse.name, nurse.phone, nurse.employee_id, nurse.department, nurse.title, nurse.hospital, nurse.status]
      );
      
      console.log(`✓ 插入护士: ${nurse.name} (${nurse.phone})`);
    }
    
    // 显示所有护士
    console.log('\n当前所有护士账号:');
    const allNurses = await db.query('SELECT id, name, phone, employee_id, department, title FROM nurses');
    console.table(allNurses);
    
    console.log('\n测试登录信息:');
    console.log('用户名: 13800138000 (或 N001)');
    console.log('密码: 任意密码 (当前为测试模式)');
    console.log('用户类型: nurse');
    
  } catch (error) {
    console.error('插入测试护士数据失败:', error);
  } finally {
    process.exit(0);
  }
}

insertTestNurse();

