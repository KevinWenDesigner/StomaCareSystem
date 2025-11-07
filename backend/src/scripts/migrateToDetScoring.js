/**
 * 数据库迁移脚本：从NPUAP标准迁移到DET评分系统
 * 
 * 功能：
 * 1. 备份旧的assessments表
 * 2. 删除旧表
 * 3. 创建新的DET评分表结构
 * 4. 尝试迁移部分历史数据（仅stoma类型）
 */

const db = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function migrateDatabase() {
  console.log('========================================');
  console.log('DET评分系统数据库迁移脚本');
  console.log('========================================\n');
  
  console.log('⚠️  警告: 此操作将：');
  console.log('1. 备份旧的assessments表到assessments_backup_npuap');
  console.log('2. 删除现有的assessments表');
  console.log('3. 创建新的DET评分表结构');
  console.log('4. 仅迁移造口类型(stoma)的历史数据，伤口数据将被舍弃\n');
  
  const answer = await question('确定要继续吗? (输入 YES 继续): ');
  
  if (answer !== 'YES') {
    console.log('操作已取消');
    rl.close();
    process.exit(0);
  }
  
  try {
    console.log('\n开始迁移...\n');
    
    // Step 1: 备份旧表
    console.log('Step 1: 备份旧表...');
    await db.query('DROP TABLE IF EXISTS assessments_backup_npuap');
    await db.query('CREATE TABLE assessments_backup_npuap LIKE assessments');
    await db.query('INSERT INTO assessments_backup_npuap SELECT * FROM assessments');
    const backupCount = await db.query('SELECT COUNT(*) as count FROM assessments_backup_npuap');
    console.log(`✅ 已备份 ${backupCount[0].count} 条记录到 assessments_backup_npuap\n`);
    
    // Step 2: 删除旧表
    console.log('Step 2: 删除旧表...');
    await db.query('DROP TABLE IF EXISTS assessments');
    console.log('✅ 已删除旧的assessments表\n');
    
    // Step 3: 创建新表（DET评分结构）
    console.log('Step 3: 创建新的DET评分表...');
    const createTableSQL = `
      CREATE TABLE assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        assessment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        -- 造口基本信息
        stoma_color VARCHAR(100),
        stoma_size VARCHAR(100),
        stoma_shape VARCHAR(100),
        skin_condition TEXT,
        
        -- DET评分详细信息 (0-15分系统)
        det_d_area TINYINT DEFAULT 0 COMMENT 'D-变色面积评分(0-3)',
        det_d_severity TINYINT DEFAULT 0 COMMENT 'D-变色程度评分(0-2)',
        det_d_total TINYINT DEFAULT 0 COMMENT 'D-变色总分(0-5)',
        det_e_area TINYINT DEFAULT 0 COMMENT 'E-侵蚀面积评分(0-3)',
        det_e_severity TINYINT DEFAULT 0 COMMENT 'E-侵蚀程度评分(0-2)',
        det_e_total TINYINT DEFAULT 0 COMMENT 'E-侵蚀总分(0-5)',
        det_t_area TINYINT DEFAULT 0 COMMENT 'T-组织增生面积评分(0-3)',
        det_t_severity TINYINT DEFAULT 0 COMMENT 'T-组织增生程度评分(0-2)',
        det_t_total TINYINT DEFAULT 0 COMMENT 'T-组织增生总分(0-5)',
        det_total TINYINT DEFAULT 0 COMMENT 'DET总分(0-15)',
        
        -- DET等级
        det_level VARCHAR(20) DEFAULT 'excellent' COMMENT 'excellent/good/moderate/poor/critical',
        
        -- DET总分（直接存储原始评分）
        score TINYINT DEFAULT 0 COMMENT 'DET总分(0-15分)',
        
        -- AI分析结果
        ai_confidence DECIMAL(3,2) DEFAULT 0.85 COMMENT 'AI置信度(0-1)',
        issues JSON COMMENT '问题列表',
        detailed_analysis TEXT COMMENT '详细分析',
        suggestions TEXT COMMENT '护理建议',
        
        -- 健康指标 (0-100%)
        metric_discoloration TINYINT DEFAULT 0 COMMENT '变色程度%',
        metric_erosion TINYINT DEFAULT 0 COMMENT '侵蚀程度%',
        metric_tissue_growth TINYINT DEFAULT 0 COMMENT '组织增生%',
        metric_overall TINYINT DEFAULT 100 COMMENT '整体健康度%',
        
        -- AI原始结果（JSON）
        ai_result JSON COMMENT 'AI返回的完整JSON',
        
        -- 护士审阅
        nurse_review BOOLEAN DEFAULT FALSE,
        nurse_comment TEXT,
        reviewed_at DATETIME,
        
        -- 时间戳
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- 索引
        INDEX idx_patient_date (patient_id, assessment_date),
        INDEX idx_det_level (det_level),
        INDEX idx_det_total (det_total),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='DET评分评估记录表';
    `;
    
    await db.query(createTableSQL);
    console.log('✅ 成功创建新的assessments表（DET评分结构）\n');
    
    // Step 4: 迁移造口数据
    console.log('Step 4: 迁移造口类型的历史数据...');
    const stomaRecords = await db.query(`
      SELECT * FROM assessments_backup_npuap 
      WHERE is_stoma = 1 OR wound_type = 'stoma'
    `);
    
    if (stomaRecords.length > 0) {
      console.log(`找到 ${stomaRecords.length} 条造口记录，开始迁移...`);
      
      let migratedCount = 0;
      for (const record of stomaRecords) {
        try {
          // 从旧的NPUAP风险等级映射到DET等级
          const detLevel = mapRiskLevelToDetLevel(record.risk_level);
          const detTotal = mapRiskLevelToDetTotal(record.risk_level);
          // score字段直接存储DET总分(0-15)
          
          // 简单的DET评分估算（基于旧的risk_level）
          const detScores = estimateDetScores(detTotal);
          
          await db.query(`
            INSERT INTO assessments (
              patient_id, image_url, assessment_date,
              stoma_color, stoma_size, stoma_shape, skin_condition,
              det_d_area, det_d_severity, det_d_total,
              det_e_area, det_e_severity, det_e_total,
              det_t_area, det_t_severity, det_t_total,
              det_total, det_level, score,
              ai_confidence, issues, detailed_analysis, suggestions,
              metric_discoloration, metric_erosion, metric_tissue_growth, metric_overall,
              ai_result, nurse_review, nurse_comment, reviewed_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            record.patient_id,
            record.image_url,
            record.assessment_date,
            record.stoma_color,
            record.stoma_size,
            null, // stoma_shape (新字段，旧数据无)
            record.skin_condition,
            detScores.d_area, detScores.d_severity, detScores.d_total,
            detScores.e_area, detScores.e_severity, detScores.e_total,
            detScores.t_area, detScores.t_severity, detScores.t_total,
            detTotal,
            detLevel,
            detTotal,  // score字段存储DET总分(0-15)
            record.confidence || 0.85,
            record.issues || JSON.stringify([]),
            record.detailed_analysis,
            record.suggestions,
            detScores.metric_discoloration,
            detScores.metric_erosion,
            detScores.metric_tissue_growth,
            detScores.metric_overall,
            record.ai_result || JSON.stringify({}),
            record.nurse_review || 0,
            record.nurse_comment,
            record.reviewed_at,
            record.created_at
          ]);
          
          migratedCount++;
        } catch (err) {
          console.log(`⚠️  迁移记录 ID ${record.id} 失败:`, err.message);
        }
      }
      
      console.log(`✅ 成功迁移 ${migratedCount} 条造口记录\n`);
    } else {
      console.log('未找到造口类型的历史记录\n');
    }
    
    // 完成
    console.log('========================================');
    console.log('✅ 迁移完成！');
    console.log('========================================');
    console.log('备份表: assessments_backup_npuap');
    console.log('新表: assessments (DET评分结构)');
    console.log('注意: 伤口类型的数据未迁移，已保留在备份表中\n');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    console.error('\n如需回滚，请执行:');
    console.error('DROP TABLE IF EXISTS assessments;');
    console.error('RENAME TABLE assessments_backup_npuap TO assessments;');
  } finally {
    rl.close();
    process.exit(0);
  }
}

// 映射旧的risk_level到DET等级
function mapRiskLevelToDetLevel(riskLevel) {
  const mapping = {
    'normal': 'excellent',
    'low': 'excellent',
    'stage_1': 'good',
    'stage-1': 'good',
    'medium': 'moderate',
    'stage_2': 'moderate',
    'stage-2': 'moderate',
    'high': 'poor',
    'stage_3': 'poor',
    'stage-3': 'poor',
    'stage_4': 'critical',
    'stage-4': 'critical',
    'critical': 'critical'
  };
  return mapping[riskLevel] || 'excellent';
}

// 映射旧的risk_level到DET总分
function mapRiskLevelToDetTotal(riskLevel) {
  const mapping = {
    'normal': 0,
    'low': 0,
    'stage_1': 2,
    'stage-1': 2,
    'medium': 5,
    'stage_2': 5,
    'stage-2': 5,
    'high': 9,
    'stage_3': 9,
    'stage-3': 9,
    'stage_4': 13,
    'stage-4': 13,
    'critical': 13
  };
  return mapping[riskLevel] || 0;
}

// 估算DET各项评分
function estimateDetScores(detTotal) {
  // 简单平均分配到D、E、T三个维度
  const avgScore = Math.floor(detTotal / 3);
  const remainder = detTotal % 3;
  
  let d_total = avgScore + (remainder > 0 ? 1 : 0);
  let e_total = avgScore + (remainder > 1 ? 1 : 0);
  let t_total = avgScore;
  
  // 确保不超过5分
  d_total = Math.min(5, d_total);
  e_total = Math.min(5, e_total);
  t_total = Math.min(5, t_total);
  
  return {
    d_area: Math.min(3, Math.floor(d_total * 0.6)),
    d_severity: Math.min(2, Math.ceil(d_total * 0.4)),
    d_total: d_total,
    e_area: Math.min(3, Math.floor(e_total * 0.6)),
    e_severity: Math.min(2, Math.ceil(e_total * 0.4)),
    e_total: e_total,
    t_area: Math.min(3, Math.floor(t_total * 0.6)),
    t_severity: Math.min(2, Math.ceil(t_total * 0.4)),
    t_total: t_total,
    metric_discoloration: Math.round((d_total / 5) * 100),
    metric_erosion: Math.round((e_total / 5) * 100),
    metric_tissue_growth: Math.round((t_total / 5) * 100),
    metric_overall: Math.round(100 - (detTotal / 15) * 100)
  };
}

// 执行迁移
migrateDatabase();

