const db = require('../config/database');

async function checkDatabaseStructure() {
  console.log('🔍 检查数据库表结构...\n');
  
  try {
    // 1. 检查 assessments 表结构
    console.log('=== ASSESSMENTS 表结构 ===');
    const assessmentColumns = await db.query(`
      SHOW COLUMNS FROM assessments
    `);
    
    console.log('\n字段列表:');
    assessmentColumns.forEach(col => {
      console.log(`  - ${col.Field.padEnd(30)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查关键字段
    const columnNames = assessmentColumns.map(col => col.Field);
    
    console.log('\n关键字段检查:');
    const requiredFields = [
      'det_level',
      'det_total', 
      'det_d_total',
      'det_e_total',
      'det_t_total',
      'score'
    ];
    
    requiredFields.forEach(field => {
      const exists = columnNames.includes(field);
      console.log(`  ${exists ? '✅' : '❌'} ${field}`);
    });
    
    // 检查旧字段
    console.log('\n旧字段检查:');
    const oldFields = ['risk_level', 'pressure_stage', 'overall_score'];
    oldFields.forEach(field => {
      const exists = columnNames.includes(field);
      console.log(`  ${exists ? '⚠️ ' : '✅'} ${field} ${exists ? '(需要删除)' : '(已移除)'}`);
    });
    
    // 2. 检查数据
    console.log('\n=== 数据检查 ===');
    const dataCheck = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT patient_id) as patients,
        SUM(CASE WHEN det_level IS NOT NULL THEN 1 ELSE 0 END) as has_det_level,
        SUM(CASE WHEN det_total > 0 THEN 1 ELSE 0 END) as has_det_total,
        MAX(assessment_date) as latest_date
      FROM assessments
    `);
    
    const stats = dataCheck[0];
    console.log(`  总评估数: ${stats.total}`);
    console.log(`  患者数: ${stats.patients}`);
    console.log(`  有DET等级: ${stats.has_det_level}`);
    console.log(`  有DET评分: ${stats.has_det_total}`);
    console.log(`  最新评估: ${stats.latest_date || '无数据'}`);
    
    // 3. DET等级分布
    if (stats.total > 0) {
      console.log('\n=== DET等级分布 ===');
      const levelDist = await db.query(`
        SELECT 
          det_level,
          COUNT(*) as count
        FROM assessments
        GROUP BY det_level
        ORDER BY count DESC
      `);
      
      levelDist.forEach(row => {
        console.log(`  ${row.det_level || '(空)'}: ${row.count}`);
      });
    }
    
    // 4. 测试 Dashboard 查询
    console.log('\n=== 测试 Dashboard 查询 ===');
    try {
      const testQuery = await db.query(`
        SELECT 
          det_level as risk_level,
          COUNT(*) as count
        FROM assessments
        WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY det_level
      `);
      console.log('  ✅ DET等级分布查询成功');
      console.log('  结果:', testQuery);
    } catch (error) {
      console.log('  ❌ 查询失败:', error.message);
      console.log('  SQL错误码:', error.code);
    }
    
    // 5. 检查 symptom_diaries 表
    console.log('\n=== SYMPTOM_DIARIES 表 ===');
    try {
      const diaryCheck = await db.query(`
        SELECT COUNT(*) as count FROM symptom_diaries
      `);
      console.log(`  ✅ 表存在，记录数: ${diaryCheck[0].count}`);
    } catch (error) {
      console.log('  ❌ 表不存在或有问题:', error.message);
    }
    
    console.log('\n✅ 检查完成！\n');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabaseStructure();

