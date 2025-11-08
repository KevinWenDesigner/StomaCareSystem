/**
 * 添加课程章节表和详细内容
 * 为教育模块添加详细的学习内容
 */

const mysql = require('mysql2/promise');

async function addCourseChapters() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 开始添加课程章节功能...\n');
    
    // 数据库配置
    const dbConfig = {
      host: process.env.DB_HOST || '192.168.20.91',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'stoma_care_db'
    };
    
    console.log('📡 连接数据库:', dbConfig.host + ':' + dbConfig.port);
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');
    
    // 1. 创建课程章节表
    console.log('📝 创建课程章节表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS course_chapters (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL COMMENT '课程ID',
        chapter_order INT NOT NULL COMMENT '章节序号',
        title VARCHAR(200) NOT NULL COMMENT '章节标题',
        content LONGTEXT COMMENT '章节内容(HTML)',
        video_url VARCHAR(255) COMMENT '视频URL',
        duration INT DEFAULT 0 COMMENT '时长(秒)',
        learning_points JSON COMMENT '学习要点',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        INDEX idx_course_id (course_id),
        INDEX idx_chapter_order (chapter_order),
        UNIQUE KEY uk_course_chapter (course_id, chapter_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程章节表';
    `);
    console.log('✅ 课程章节表创建成功\n');
    
    // 2. 插入详细的章节内容
    console.log('📚 插入课程章节数据...\n');
    
    // 课程1：认识造口
    await connection.query(`
      INSERT INTO course_chapters (course_id, chapter_order, title, content, duration, learning_points) VALUES
      (1, 1, '什么是造口', 
       '<h2>造口的定义</h2>
        <p>造口（Stoma）是通过外科手术将消化道或泌尿道的一段引出到体表形成的人工开口。造口手术是为了治疗某些疾病而必须进行的重要治疗手段。</p>
        <h3>造口的作用</h3>
        <ul>
          <li><strong>排泄功能</strong>：帮助身体排出废物和尿液</li>
          <li><strong>保护功能</strong>：保护下段肠道或尿路愈合</li>
          <li><strong>治疗功能</strong>：治疗某些疾病的必要手段</li>
        </ul>
        <h3>常见情况</h3>
        <p>造口手术通常用于结直肠癌、溃疡性结肠炎、克罗恩病、膀胱癌等疾病的治疗。根据统计，全球每年约有100万人接受造口手术。</p>
        <div class="tip-box">
          <strong>💡 重要提示：</strong>
          <p>造口虽然改变了排泄方式，但在正确护理的情况下，完全可以恢复正常生活，包括工作、运动和社交。</p>
        </div>', 
       300, 
       '["了解造口的基本定义和作用", "认识常见的造口类型", "理解造口手术的必要性", "建立正确的康复信心"]'),
       
      (1, 2, '造口的类型', 
       '<h2>按解剖部位分类</h2>
        <h3>1. 结肠造口（Colostomy）</h3>
        <p>将结肠的一部分引出到腹壁形成造口。根据位置不同分为：</p>
        <ul>
          <li><strong>升结肠造口</strong>：位于右下腹，排出物较稀</li>
          <li><strong>横结肠造口</strong>：位于上腹部，排出物半固体</li>
          <li><strong>降结肠/乙状结肠造口</strong>：位于左下腹，排出物成形</li>
        </ul>
        
        <h3>2. 回肠造口（Ileostomy）</h3>
        <p>将回肠末端引出到腹壁形成造口，通常位于右下腹。</p>
        <ul>
          <li>排出物：液体或半液体状</li>
          <li>排泄频率：较高（每天6-8次）</li>
          <li>护理要点：需要更频繁更换造口袋</li>
        </ul>
        
        <h3>3. 尿路造口（Urostomy）</h3>
        <p>用于尿液引流的造口，包括肾造口、输尿管造口等。</p>
        <ul>
          <li>排出物：尿液</li>
          <li>护理要点：需要防止尿液反流</li>
        </ul>
        
        <h2>按时间分类</h2>
        <ul>
          <li><strong>永久性造口</strong>：终身保留</li>
          <li><strong>临时性造口</strong>：可在一段时间后还纳</li>
        </ul>
        
        <div class="note-box">
          <strong>📝 记忆要点：</strong>
          <p>不同类型的造口有不同的护理方法和注意事项，了解自己造口的类型对于正确护理非常重要。</p>
        </div>', 
       480, 
       '["掌握结肠造口、回肠造口、尿路造口的区别", "了解不同造口的排泄物特点", "识别临时性和永久性造口", "知道自己造口的类型"]'),
       
      (1, 3, '造口护理的重要性', 
       '<h2>为什么造口护理如此重要</h2>
        <p>良好的造口护理不仅能预防并发症，还能提高生活质量，帮助患者重返正常生活。</p>
        
        <h3>1. 预防并发症</h3>
        <ul>
          <li><strong>皮肤问题</strong>：防止造口周围皮肤红肿、溃破</li>
          <li><strong>感染风险</strong>：降低局部和系统感染的可能</li>
          <li><strong>造口脱垂</strong>：避免造口突出过多</li>
          <li><strong>造口回缩</strong>：防止造口退回腹腔</li>
          <li><strong>疝形成</strong>：预防造口旁疝的发生</li>
        </ul>
        
        <h3>2. 提高生活质量</h3>
        <p>正确的护理能够：</p>
        <ul>
          <li>减少异味困扰</li>
          <li>防止渗漏尴尬</li>
          <li>保持皮肤健康</li>
          <li>增强自信心</li>
          <li>恢复社交活动</li>
        </ul>
        
        <h3>3. 心理健康</h3>
        <p>掌握护理技能能够：</p>
        <ul>
          <li>增强自我照护能力</li>
          <li>减轻焦虑和恐惧</li>
          <li>建立积极心态</li>
          <li>提升生活信心</li>
        </ul>
        
        <div class="success-story">
          <h4>💪 康复案例</h4>
          <p>李女士在接受造口手术后，通过系统学习护理知识，不仅完全恢复了正常生活，还成为了造口护理志愿者，帮助更多的患者重拾信心。</p>
        </div>
        
        <div class="important-box">
          <strong>⚠️ 记住：</strong>
          <p>造口护理是一项可以学会的技能，只要掌握正确的方法，每个人都能做好自我护理！</p>
        </div>', 
       420, 
       '["理解造口护理对预防并发症的重要性", "认识良好护理对生活质量的影响", "建立正确的自我护理信心", "了解常见并发症及预防方法"]')
      ON DUPLICATE KEY UPDATE title=title;
    `);
    
    // 课程2：造口用品认知
    await connection.query(`
      INSERT INTO course_chapters (course_id, chapter_order, title, content, duration, learning_points) VALUES
      (2, 1, '造口袋的种类', 
       '<h2>造口袋分类</h2>
        <h3>一件式造口袋</h3>
        <p><strong>特点：</strong>底盘和袋子连为一体</p>
        <ul>
          <li><strong>优点</strong>：操作简单、轻薄服帖、价格相对便宜</li>
          <li><strong>缺点</strong>：每次更换需要撕掉底盘，可能对皮肤刺激较大</li>
          <li><strong>适用</strong>：造口较规则、皮肤状况好、短期使用</li>
        </ul>
        
        <h3>两件式造口袋</h3>
        <p><strong>特点：</strong>底盘和袋子分离</p>
        <ul>
          <li><strong>优点</strong>：可单独更换袋子、对皮肤刺激小、适合长期使用</li>
          <li><strong>缺点</strong>：相对厚重、价格较高、需要学习连接技巧</li>
          <li><strong>适用</strong>：永久性造口、皮肤敏感、需要频繁观察造口</li>
        </ul>
        
        <h3>按袋子类型分类</h3>
        <ul>
          <li><strong>开口袋</strong>：底部可开启，适合成形便</li>
          <li><strong>闭口袋</strong>：不可开启，用完即弃</li>
          <li><strong>尿路袋</strong>：带引流阀，用于尿路造口</li>
        </ul>
        
        <div class="comparison-table">
          <h4>选择建议对比表</h4>
          <table>
            <tr><th>造口类型</th><th>推荐选择</th><th>理由</th></tr>
            <tr><td>结肠造口</td><td>两件式开口袋</td><td>便于倾倒成形便</td></tr>
            <tr><td>回肠造口</td><td>一件式闭口袋</td><td>排泄物稀，需频繁更换</td></tr>
            <tr><td>尿路造口</td><td>两件式尿路袋</td><td>持续引流尿液</td></tr>
          </table>
        </div>', 
       420, 
       '["识别一件式和两件式造口袋的区别", "了解开口袋和闭口袋的用途", "学会根据造口类型选择合适的造口袋", "掌握造口袋的基本特点"]'),
       
      (2, 2, '底盘的选择', 
       '<h2>底盘（皮肤保护板）的重要性</h2>
        <p>底盘是直接接触皮肤的部分，选择合适的底盘对保护造口周围皮肤至关重要。</p>
        
        <h3>底盘类型</h3>
        <ul>
          <li><strong>平面底盘</strong>：适合平坦或略微隆起的造口</li>
          <li><strong>凸面底盘</strong>：适合回缩或平坦的造口，增加造口突出度</li>
          <li><strong>可塑型底盘</strong>：柔软可塑，适合不规则造口</li>
        </ul>
        
        <h3>底盘材质</h3>
        <ul>
          <li><strong>亲水胶体</strong>：吸收能力强，保护皮肤</li>
          <li><strong>标准型</strong>：适合正常皮肤</li>
          <li><strong>加强型</strong>：适合易出汗或皮肤湿润</li>
        </ul>
        
        <h3>开孔尺寸</h3>
        <p>底盘中心开孔应比造口直径大2-3mm：</p>
        <ul>
          <li><strong>预切型</strong>：固定尺寸开孔</li>
          <li><strong>可剪型</strong>：可根据造口大小自行剪切</li>
        </ul>
        
        <div class="tip-box">
          <strong>💡 测量技巧：</strong>
          <p>使用造口测量卡（通常随造口袋附送）测量造口最大直径，然后加2-3mm确定开孔尺寸。造口大小在术后3个月内可能变化，需要定期测量。</p>
        </div>', 
       360, 
       '["了解底盘的作用和重要性", "识别不同类型底盘的特点", "学会选择合适的底盘类型", "掌握底盘开孔尺寸的测量方法"]'),
       
      (2, 3, '辅助用品介绍', 
       '<h2>造口护理辅助用品</h2>
        
        <h3>1. 防漏产品</h3>
        <ul>
          <li><strong>防漏膏</strong>：填平造口周围皱褶，增强密封性</li>
          <li><strong>防漏粉</strong>：吸收渗液，保持皮肤干燥</li>
          <li><strong>防漏环/条</strong>：提供额外密封保护</li>
        </ul>
        
        <h3>2. 皮肤保护产品</h3>
        <ul>
          <li><strong>皮肤保护膜</strong>：在皮肤表面形成保护层</li>
          <li><strong>皮肤保护粉</strong>：治疗轻度皮肤破损</li>
          <li><strong>皮肤保护喷雾</strong>：方便快捷的保护方式</li>
        </ul>
        
        <h3>3. 清洁用品</h3>
        <ul>
          <li><strong>造口清洁湿巾</strong>：方便快捷</li>
          <li><strong>温和清洁液</strong>：不含酒精和香料</li>
          <li><strong>软质纱布</strong>：温和不伤皮肤</li>
        </ul>
        
        <h3>4. 除臭产品</h3>
        <ul>
          <li><strong>袋内除臭剂</strong>：滴入造口袋内</li>
          <li><strong>除臭贴片</strong>：贴在造口袋外</li>
          <li><strong>空气清新剂</strong>：环境除臭</li>
        </ul>
        
        <h3>5. 其他辅助用品</h3>
        <ul>
          <li><strong>腰带</strong>：固定造口袋，适合运动时使用</li>
          <li><strong>造口袋套</strong>：保护隐私，美观舒适</li>
          <li><strong>造口剪</strong>：专用于剪裁底盘开孔</li>
          <li><strong>测量卡</strong>：精确测量造口尺寸</li>
        </ul>
        
        <div class="shopping-guide">
          <h4>🛒 采购建议</h4>
          <p><strong>必备品：</strong>造口袋、清洁用品、皮肤保护膜</p>
          <p><strong>建议备用：</strong>防漏膏、除臭剂、腰带（运动时）</p>
          <p><strong>按需选择：</strong>造口袋套、特殊护肤产品</p>
        </div>
        
        <div class="note-box">
          <strong>📝 注意：</strong>
          <p>并非所有产品都需要购买，请根据个人情况和医护人员建议选择合适的产品。</p>
        </div>', 
       480, 
       '["了解常用的造口护理辅助用品", "掌握各类辅助用品的用途", "学会根据需要选择合适的产品", "建立科学的用品采购观念"]')
      ON DUPLICATE KEY UPDATE title=title;
    `);
    
    console.log('✅ 课程章节数据插入成功\n');
    
    // 3. 更新courses表，添加总时长
    console.log('🔄 更新课程总时长...');
    await connection.query(`
      UPDATE courses c
      SET c.duration = (
        SELECT IFNULL(SUM(duration), 0)
        FROM course_chapters
        WHERE course_id = c.id
      )
      WHERE EXISTS (
        SELECT 1 FROM course_chapters WHERE course_id = c.id
      );
    `);
    console.log('✅ 课程总时长更新成功\n');
    
    console.log('='.repeat(60));
    console.log('🎉 课程章节功能添加完成！\n');
    console.log('已添加的内容：');
    console.log('  - course_chapters 表（课程章节表）');
    console.log('  - 课程1（认识造口）：3个章节');
    console.log('  - 课程2（造口用品认知）：3个章节');
    console.log('  - 更多课程章节可继续添加\n');
    
    // 显示统计信息
    const [chapters] = await connection.query(`
      SELECT 
        c.id,
        c.title as course_title,
        COUNT(cc.id) as chapter_count,
        SUM(cc.duration) as total_duration
      FROM courses c
      LEFT JOIN course_chapters cc ON c.id = cc.course_id
      WHERE c.id <= 2
      GROUP BY c.id
    `);
    
    console.log('📊 课程章节统计：');
    chapters.forEach(row => {
      console.log(`  ${row.course_title}：${row.chapter_count}个章节，总时长 ${Math.ceil(row.total_duration / 60)}分钟`);
    });
    console.log();
    
  } catch (error) {
    console.error('❌ 添加课程章节失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行脚本
if (require.main === module) {
  addCourseChapters();
}

module.exports = addCourseChapters;

