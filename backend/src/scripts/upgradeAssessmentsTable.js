const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * 升级 assessments 表以支持完整的通义千问AI分析和NPUAP标准
 */
async function upgradeAssessmentsTable() {
  let connection;
  
  try {
    console.log('🚀 开始升级 assessments 表...\n');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'stoma_care',
      timezone: '+08:00'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 添加 score 字段（AI智能评分）
    console.log('📝 添加 score 字段...');
    try {
      await connection.query(`
        ALTER TABLE assessments 
        ADD COLUMN score INT DEFAULT 0 COMMENT 'AI智能评分(0-100)' 
        AFTER skin_condition
      `);
      console.log('✅ score 字段添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  score 字段已存在，跳过');
      } else {
        throw err;
      }
    }
    
    // 2. 添加 pressure_stage 字段（NPUAP分期）
    console.log('📝 添加 pressure_stage 字段...');
    try {
      await connection.query(`
        ALTER TABLE assessments 
        ADD COLUMN pressure_stage VARCHAR(20) COMMENT 'NPUAP压疮分期' 
        AFTER score
      `);
      console.log('✅ pressure_stage 字段添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  pressure_stage 字段已存在，跳过');
      } else {
        throw err;
      }
    }
    
    // 3. 添加 confidence 字段（AI置信度）
    console.log('📝 添加 confidence 字段...');
    try {
      await connection.query(`
        ALTER TABLE assessments 
        ADD COLUMN confidence DECIMAL(3,2) DEFAULT 0.85 COMMENT 'AI置信度(0-1)' 
        AFTER pressure_stage
      `);
      console.log('✅ confidence 字段添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  confidence 字段已存在，跳过');
      } else {
        throw err;
      }
    }
    
    // 4. 添加 issues 字段（问题列表）
    console.log('📝 添加 issues 字段...');
    try {
      await connection.query(`
        ALTER TABLE assessments 
        ADD COLUMN issues TEXT COMMENT '识别的问题列表(JSON数组)' 
        AFTER confidence
      `);
      console.log('✅ issues 字段添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  issues 字段已存在，跳过');
      } else {
        throw err;
      }
    }
    
    // 5. 添加 detailed_analysis 字段（详细分析）
    console.log('📝 添加 detailed_analysis 字段...');
    try {
      await connection.query(`
        ALTER TABLE assessments 
        ADD COLUMN detailed_analysis TEXT COMMENT 'AI详细分析文本' 
        AFTER issues
      `);
      console.log('✅ detailed_analysis 字段添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  detailed_analysis 字段已存在，跳过');
      } else {
        throw err;
      }
    }
    
    // 6. 添加 is_stoma 字段（是否是造口）
    console.log('📝 添加 is_stoma 字段...');
    try {
      await connection.query(`
        ALTER TABLE assessments 
        ADD COLUMN is_stoma TINYINT DEFAULT 1 COMMENT '是否是造口(1-是,0-否)' 
        AFTER detailed_analysis
      `);
      console.log('✅ is_stoma 字段添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  is_stoma 字段已存在，跳过');
      } else {
        throw err;
      }
    }
    
    // 7. 添加 wound_type 字段（伤口类型）
    console.log('📝 添加 wound_type 字段...');
    try {
      await connection.query(`
        ALTER TABLE assessments 
        ADD COLUMN wound_type VARCHAR(20) DEFAULT 'stoma' COMMENT '类型(stoma-造口,wound-伤口,other-其他)' 
        AFTER is_stoma
      `);
      console.log('✅ wound_type 字段添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  wound_type 字段已存在，跳过');
      } else {
        throw err;
      }
    }
    
    // 7. 修改 risk_level 字段以支持更多分期
    console.log('📝 修改 risk_level 字段类型...');
    try {
      await connection.query(`
        ALTER TABLE assessments 
        MODIFY COLUMN risk_level VARCHAR(20) COMMENT '风险等级/NPUAP分期'
      `);
      console.log('✅ risk_level 字段类型修改成功');
    } catch (err) {
      console.log('⚠️  risk_level 字段修改失败（可能已是VARCHAR类型）:', err.message);
    }
    
    // 8. 添加索引以提高查询性能
    console.log('📝 添加索引...');
    try {
      await connection.query(`
        CREATE INDEX idx_score ON assessments(score)
      `);
      console.log('✅ score 索引添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  score 索引已存在，跳过');
      } else {
        console.log('⚠️  索引添加失败:', err.message);
      }
    }
    
    try {
      await connection.query(`
        CREATE INDEX idx_pressure_stage ON assessments(pressure_stage)
      `);
      console.log('✅ pressure_stage 索引添加成功');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  pressure_stage 索引已存在，跳过');
      } else {
        console.log('⚠️  索引添加失败:', err.message);
      }
    }
    
    console.log('\n🎉 assessments 表升级完成！\n');
    
    // 显示升级后的表结构
    console.log('📊 升级后的表结构：\n');
    const [columns] = await connection.query(`
      SHOW FULL COLUMNS FROM assessments
    `);
    
    console.table(columns.map(col => ({
      字段: col.Field,
      类型: col.Type,
      说明: col.Comment
    })));
    
    console.log('\n✅ 数据库升级完成！现在支持：');
    console.log('  ✓ AI智能评分（score）');
    console.log('  ✓ NPUAP压疮分期（pressure_stage）');
    console.log('  ✓ AI置信度（confidence）');
    console.log('  ✓ 问题列表（issues）');
    console.log('  ✓ 详细分析（detailed_analysis）');
    console.log('  ✓ 造口识别（is_stoma）');
    console.log('\n');
    
  } catch (error) {
    console.error('❌ 升级失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行升级
if (require.main === module) {
  upgradeAssessmentsTable();
}

module.exports = upgradeAssessmentsTable;

