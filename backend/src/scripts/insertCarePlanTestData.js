const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * 插入护理计划测试数据
 * 为测试患者创建护理计划和任务项目
 */
async function insertCarePlanTestData() {
  let connection;
  
  try {
    console.log('🚀 开始插入护理计划测试数据...\n');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'stoma_care_db',
      timezone: '+08:00'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 获取第一个患者ID
    const [patients] = await connection.query('SELECT id, name FROM patients LIMIT 1');
    
    if (patients.length === 0) {
      console.log('❌ 没有找到患者数据，请先创建患者');
      console.log('💡 提示：运行 npm run init-db 初始化数据库\n');
      return;
    }
    
    const patientId = patients[0].id;
    const patientName = patients[0].name;
    
    console.log(`📌 为患者 ${patientName} (ID: ${patientId}) 创建护理计划\n`);
    
    // 检查是否已有护理计划
    const [existingPlans] = await connection.query(
      'SELECT id FROM care_plans WHERE patient_id = ?',
      [patientId]
    );
    
    let planId;
    
    if (existingPlans.length > 0) {
      planId = existingPlans[0].id;
      console.log(`ℹ️  患者已有护理计划 (ID: ${planId})，将更新任务项目\n`);
      
      // 清空现有任务项目
      await connection.query('DELETE FROM care_plan_items WHERE plan_id = ?', [planId]);
    } else {
      // 创建护理计划
      console.log('📝 创建新的护理计划...');
      const [planResult] = await connection.query(`
        INSERT INTO care_plans (
          patient_id, 
          title, 
          description, 
          start_date, 
          end_date, 
          frequency, 
          status, 
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        patientId,
        '造口日常护理计划',
        '针对造口患者的全面护理计划，包括日常清洁、造口袋更换、皮肤护理等',
        '2024-01-15', // 开始日期
        '2024-12-31', // 结束日期
        'daily',      // 频率：每日
        'active',     // 状态：活跃
        '请按照计划执行，有问题及时联系护士'
      ]);
      
      planId = planResult.insertId;
      console.log(`✅ 护理计划创建成功 (ID: ${planId})\n`);
    }
    
    // 创建护理任务项目
    console.log('📝 创建护理任务项目...');
    
    const tasks = [
      {
        title: '造口清洁',
        description: '使用生理盐水清洁造口周围皮肤，保持清洁干燥',
        target_value: '每日2次',
        sort_order: 1
      },
      {
        title: '造口袋更换',
        description: '检查造口袋是否需要更换，注意皮肤状况',
        target_value: '3-5天更换一次',
        sort_order: 2
      },
      {
        title: '症状记录',
        description: '记录今日造口情况、排泄物性状、有无不适',
        target_value: '每日记录',
        sort_order: 3
      },
      {
        title: '皮肤护理',
        description: '检查造口周围皮肤，必要时涂抹皮肤保护剂',
        target_value: '每日检查',
        sort_order: 4
      },
      {
        title: '饮食记录',
        description: '记录今日饮食，注意是否有不适反应',
        target_value: '每日记录',
        sort_order: 5
      },
      {
        title: '运动康复',
        description: '进行适度的康复运动，如散步、轻度拉伸',
        target_value: '每日30分钟',
        sort_order: 6
      },
      {
        title: '观察排泄情况',
        description: '观察造口排泄物的颜色、性状、量',
        target_value: '每日观察',
        sort_order: 7
      },
      {
        title: '水分补充',
        description: '保证每日足够的水分摄入',
        target_value: '1500-2000ml/天',
        sort_order: 8
      }
    ];
    
    for (const task of tasks) {
      await connection.query(`
        INSERT INTO care_plan_items (
          plan_id,
          title,
          description,
          target_value,
          completed,
          sort_order
        ) VALUES (?, ?, ?, ?, 0, ?)
      `, [
        planId,
        task.title,
        task.description,
        task.target_value,
        task.sort_order
      ]);
    }
    
    console.log(`✅ 成功创建 ${tasks.length} 个护理任务项目\n`);
    
    // 查询并显示创建的护理计划
    const [plan] = await connection.query(`
      SELECT 
        cp.*,
        COUNT(cpi.id) as task_count
      FROM care_plans cp
      LEFT JOIN care_plan_items cpi ON cp.id = cpi.plan_id
      WHERE cp.id = ?
      GROUP BY cp.id
    `, [planId]);
    
    console.log('📋 护理计划详情:');
    console.log('  计划ID:', plan[0].id);
    console.log('  标题:', plan[0].title);
    console.log('  描述:', plan[0].description);
    console.log('  开始日期:', plan[0].start_date);
    console.log('  结束日期:', plan[0].end_date);
    console.log('  状态:', plan[0].status);
    console.log('  任务数量:', plan[0].task_count);
    console.log('');
    
    console.log('🎉 护理计划测试数据插入完成！\n');
    console.log('💡 提示：');
    console.log('  - 在患者端小程序中打开"护理计划"页面即可查看');
    console.log('  - 点击任务可以标记完成状态');
    console.log('  - 任务状态会自动同步到后端数据库\n');
    
  } catch (error) {
    console.error('❌ 插入护理计划测试数据失败:', error.message);
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
  insertCarePlanTestData();
}

module.exports = insertCarePlanTestData;








