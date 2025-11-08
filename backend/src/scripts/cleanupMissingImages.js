const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * 清理数据库中引用不存在图片的评估记录
 */
async function cleanupMissingImages() {
  try {
    console.log('🔍 开始检查评估记录中的图片...\n');
    
    // 获取所有评估记录
    const query = `
      SELECT id, patient_id, image_url, created_at 
      FROM assessments 
      ORDER BY created_at DESC
    `;
    
    const assessments = await db.query(query);
    console.log(`📊 数据库中共有 ${assessments.length} 条评估记录\n`);
    
    const missingImages = [];
    const validImages = [];
    
    // 检查每条记录的图片是否存在
    for (const assessment of assessments) {
      if (!assessment.image_url) {
        console.log(`⚠️  评估ID ${assessment.id} 没有图片URL`);
        missingImages.push(assessment);
        continue;
      }
      
      // 从URL构建文件路径
      // image_url格式: /uploads/assessments/image_xxx.jpg
      const imagePath = path.join(__dirname, '../../', assessment.image_url);
      
      if (!fs.existsSync(imagePath)) {
        console.log(`❌ 缺失: ${assessment.image_url} (评估ID: ${assessment.id}, 创建时间: ${assessment.created_at})`);
        missingImages.push(assessment);
      } else {
        validImages.push(assessment);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ 有效图片: ${validImages.length} 个`);
    console.log(`❌ 缺失图片: ${missingImages.length} 个`);
    console.log('='.repeat(60) + '\n');
    
    if (missingImages.length === 0) {
      console.log('🎉 所有评估记录的图片都存在，无需清理！');
      process.exit(0);
    }
    
    // 询问是否删除缺失图片的记录
    console.log('⚠️  发现以下评估记录的图片文件不存在：');
    console.log('');
    
    missingImages.slice(0, 10).forEach(assessment => {
      console.log(`  - ID: ${assessment.id}, 图片: ${assessment.image_url}`);
    });
    
    if (missingImages.length > 10) {
      console.log(`  ... 还有 ${missingImages.length - 10} 条记录`);
    }
    
    console.log('');
    console.log('💡 你可以选择：');
    console.log('   1. 删除这些记录（执行: node cleanupMissingImages.js --delete）');
    console.log('   2. 导出这些记录的ID（执行: node cleanupMissingImages.js --export）');
    console.log('   3. 仅查看统计（当前模式）');
    console.log('');
    
    // 检查命令行参数
    const args = process.argv.slice(2);
    
    if (args.includes('--delete')) {
      console.log('🗑️  开始删除缺失图片的评估记录...\n');
      
      const ids = missingImages.map(a => a.id);
      const deleteQuery = `DELETE FROM assessments WHERE id IN (${ids.join(',')})`;
      
      await db.query(deleteQuery);
      console.log(`✅ 已删除 ${missingImages.length} 条评估记录`);
    } else if (args.includes('--export')) {
      const exportFile = path.join(__dirname, 'missing_images_report.json');
      fs.writeFileSync(exportFile, JSON.stringify(missingImages, null, 2));
      console.log(`📄 已导出报告到: ${exportFile}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

// 运行清理
cleanupMissingImages();

