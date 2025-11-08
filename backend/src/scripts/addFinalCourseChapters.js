/**
 * 添加课程4和课程5的详细章节内容
 * 课程4: 造口患者饮食原则
 * 课程5: 处理造口周围皮肤问题
 */

const mysql = require('mysql2/promise');

async function addFinalCourseChapters() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 开始添加课程4和5的章节内容...\n');
    
    const dbConfig = {
      host: process.env.DB_HOST || '192.168.20.91',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'stoma_care_db'
    };
    
    console.log('📡 连接数据库:', dbConfig.host + ':' + dbConfig.port);
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');
    
    // 课程4：造口患者饮食原则
    console.log('📚 添加课程4（造口患者饮食原则）的章节...');
    await connection.query(`
      INSERT INTO course_chapters (course_id, chapter_order, title, content, duration, learning_points) VALUES
      (4, 1, '饮食基本原则', 
       '<h2>造口患者的饮食指导</h2>
        <p>合理的饮食对造口患者的康复和生活质量至关重要。正确的饮食可以帮助控制排泄，预防并发症，提高生活质量。</p>
        
        <h3>1. 饮食基本原则</h3>
        
        <h4>循序渐进原则：</h4>
        <ul>
          <li><strong>术后初期</strong>：清流质→流质→半流质→软食→普食</li>
          <li><strong>逐步添加</strong>：每次只添加一种新食物</li>
          <li><strong>观察反应</strong>：记录食物对排泄的影响</li>
          <li><strong>个体化调整</strong>：根据自身情况调整</li>
        </ul>
        
        <h4>少食多餐原则：</h4>
        <ul>
          <li>每天5-6餐，避免暴饮暴食</li>
          <li>每餐七八分饱</li>
          <li>规律进食时间</li>
          <li>睡前2-3小时避免进食</li>
        </ul>
        
        <h4>细嚼慢咽原则：</h4>
        <ul>
          <li>充分咀嚼食物（每口20-30次）</li>
          <li>放慢进食速度</li>
          <li>帮助消化，减少气体</li>
          <li>降低肠道负担</li>
        </ul>
        
        <h4>均衡营养原则：</h4>
        <ul>
          <li>保证蛋白质摄入（鱼、肉、蛋、奶）</li>
          <li>适量碳水化合物（米饭、面食）</li>
          <li>充足维生素和矿物质（蔬菜、水果）</li>
          <li>足够的水分（每天1500-2000ml）</li>
        </ul>
        
        <h3>2. 不同造口类型的饮食建议</h3>
        
        <h4>结肠造口：</h4>
        <ul>
          <li>排泄物较成形，饮食限制较少</li>
          <li>注意摄入纤维素，保持排便规律</li>
          <li>可逐步恢复正常饮食</li>
        </ul>
        
        <h4>回肠造口：</h4>
        <ul>
          <li>排泄物稀薄，需要控制</li>
          <li>限制高纤维食物</li>
          <li>注意水分和电解质平衡</li>
          <li>避免产气食物</li>
        </ul>
        
        <h4>尿路造口：</h4>
        <ul>
          <li>多饮水（每天2000ml以上）</li>
          <li>预防尿路感染</li>
          <li>适量摄入维生素C</li>
        </ul>
        
        <h3>3. 水分管理</h3>
        
        <h4>推荐饮水量：</h4>
        <ul>
          <li><strong>结肠造口</strong>：1500-2000ml/天</li>
          <li><strong>回肠造口</strong>：2000-2500ml/天</li>
          <li><strong>尿路造口</strong>：2500-3000ml/天</li>
        </ul>
        
        <h4>饮水方法：</h4>
        <ul>
          <li>小口慢饮，避免一次大量饮水</li>
          <li>分次饮用，全天均匀分布</li>
          <li>温水为佳，避免冰水</li>
          <li>观察尿液颜色（淡黄色为宜）</li>
        </ul>
        
        <h3>4. 进食时间安排</h3>
        
        <h4>推荐时间表：</h4>
        <ul>
          <li><strong>早餐</strong>：7:00-8:00</li>
          <li><strong>上午加餐</strong>：10:00</li>
          <li><strong>午餐</strong>：12:00-13:00</li>
          <li><strong>下午加餐</strong>：15:00</li>
          <li><strong>晚餐</strong>：17:00-18:00</li>
          <li><strong>睡前</strong>：避免进食（20:00后）</li>
        </ul>
        
        <div class="tip-box">
          <strong>💡 饮食日记</strong>
          <p>建议记录饮食日记，包括：</p>
          <ul>
            <li>进食的食物和时间</li>
            <li>排泄的次数和性状</li>
            <li>不适症状</li>
            <li>找出适合自己的食物</li>
          </ul>
        </div>', 
       480, 
       '["掌握造口患者的饮食基本原则", "了解不同造口类型的饮食差异", "学会合理安排进食时间和份量", "建立个性化的饮食管理方案"]'),
       
      (4, 2, '推荐食物清单', 
       '<h2>适宜食物选择</h2>
        <p>选择合适的食物可以帮助控制排泄，减少不适，促进康复。</p>
        
        <h3>1. 主食类（推荐）</h3>
        <ul>
          <li>✅ 白米饭、白面包</li>
          <li>✅ 面条、馒头</li>
          <li>✅ 小米粥、大米粥</li>
          <li>✅ 藕粉、山药</li>
          <li>✅ 土豆泥</li>
        </ul>
        
        <h4>作用：</h4>
        <p>容易消化，提供能量，帮助大便成形（结肠造口）</p>
        
        <h3>2. 蛋白质类（推荐）</h3>
        
        <h4>优质蛋白：</h4>
        <ul>
          <li>✅ 鸡蛋（煮、蒸）</li>
          <li>✅ 鸡胸肉、鸡汤</li>
          <li>✅ 瘦猪肉、牛肉</li>
          <li>✅ 鱼肉（清蒸、煮汤）</li>
          <li>✅ 豆腐、豆浆</li>
          <li>✅ 牛奶、酸奶</li>
        </ul>
        
        <h4>作用：</h4>
        <p>促进伤口愈合，增强体质，维持肌肉量</p>
        
        <h3>3. 蔬菜类（选择性食用）</h3>
        
        <h4>推荐蔬菜：</h4>
        <ul>
          <li>✅ 南瓜、冬瓜</li>
          <li>✅ 胡萝卜</li>
          <li>✅ 西红柿（去皮）</li>
          <li>✅ 土豆、芋头</li>
          <li>✅ 菠菜（煮熟）</li>
        </ul>
        
        <h4>烹饪方法：</h4>
        <ul>
          <li>切碎、煮烂</li>
          <li>去除粗纤维</li>
          <li>适量摄入</li>
        </ul>
        
        <h3>4. 水果类（选择性食用）</h3>
        
        <h4>推荐水果：</h4>
        <ul>
          <li>✅ 香蕉（成熟的）</li>
          <li>✅ 苹果（去皮、煮熟或蒸熟）</li>
          <li>✅ 木瓜</li>
          <li>✅ 火龙果</li>
          <li>✅ 猕猴桃</li>
        </ul>
        
        <h4>食用方法：</h4>
        <ul>
          <li>少量、多次</li>
          <li>去皮、去籽</li>
          <li>避免空腹食用</li>
          <li>观察个体反应</li>
        </ul>
        
        <h3>5. 有益食物</h3>
        
        <h4>帮助大便成形（结肠造口）：</h4>
        <ul>
          <li>白米饭、面条</li>
          <li>香蕉、苹果泥</li>
          <li>酸奶</li>
          <li>土豆、山药</li>
        </ul>
        
        <h4>减少气味：</h4>
        <ul>
          <li>蔓越莓汁</li>
          <li>酸奶</li>
          <li>欧芹、薄荷</li>
        </ul>
        
        <h4>补充电解质（回肠造口）：</h4>
        <ul>
          <li>运动饮料</li>
          <li>椰子水</li>
          <li>清淡汤品</li>
          <li>盐水</li>
        </ul>
        
        <h3>6. 营养补充</h3>
        
        <h4>维生素：</h4>
        <ul>
          <li><strong>维生素B12</strong>：回肠造口患者需补充</li>
          <li><strong>维生素C</strong>：促进伤口愈合</li>
          <li><strong>维生素D</strong>：促进钙吸收</li>
        </ul>
        
        <h4>矿物质：</h4>
        <ul>
          <li><strong>钠、钾</strong>：回肠造口易流失，需补充</li>
          <li><strong>钙</strong>：预防骨质疏松</li>
          <li><strong>铁</strong>：预防贫血</li>
        </ul>
        
        <div class="tip-box">
          <strong>💡 食物选择技巧：</strong>
          <ul>
            <li>新鲜、清洁、卫生</li>
            <li>易消化、少刺激</li>
            <li>营养丰富、多样化</li>
            <li>根据个体反应调整</li>
          </ul>
        </div>', 
       420, 
       '["了解适合造口患者的食物清单", "掌握不同食物的作用和效果", "学会根据造口类型选择食物", "懂得营养补充的重要性"]'),
       
      (4, 3, '需要限制的食物', 
       '<h2>需要限制或避免的食物</h2>
        <p>某些食物可能导致排泄物增多、产气、异味或其他不适，需要限制或避免。</p>
        
        <h3>1. 高纤维食物（需控制）</h3>
        
        <h4>粗纤维蔬菜：</h4>
        <ul>
          <li>⚠️ 芹菜、韭菜</li>
          <li>⚠️ 竹笋、蘑菇</li>
          <li>⚠️ 豆角、豌豆</li>
          <li>⚠️ 白菜帮、菜心</li>
        </ul>
        
        <h4>影响：</h4>
        <ul>
          <li>可能堵塞造口</li>
          <li>增加排泄次数</li>
          <li>不易消化</li>
        </ul>
        
        <h4>如何食用：</h4>
        <ul>
          <li>少量尝试</li>
          <li>切碎、煮烂</li>
          <li>充分咀嚼</li>
          <li>观察反应</li>
        </ul>
        
        <h3>2. 产气食物（需限制）</h3>
        
        <h4>易产气食物：</h4>
        <ul>
          <li>❌ 豆类（黄豆、红豆、黑豆）</li>
          <li>❌ 十字花科蔬菜（西兰花、花椰菜、卷心菜）</li>
          <li>❌ 洋葱、大蒜</li>
          <li>❌ 萝卜</li>
          <li>❌ 碳酸饮料</li>
          <li>❌ 啤酒</li>
          <li>❌ 口香糖</li>
        </ul>
        
        <h4>影响：</h4>
        <ul>
          <li>造口袋膨胀</li>
          <li>腹胀不适</li>
          <li>增加排气</li>
          <li>可能有异味</li>
        </ul>
        
        <h3>3. 产生异味的食物</h3>
        
        <h4>强烈气味食物：</h4>
        <ul>
          <li>❌ 洋葱、大蒜</li>
          <li>❌ 韭菜</li>
          <li>❌ 鱼类（某些）</li>
          <li>❌ 鸡蛋（过量）</li>
          <li>❌ 芦笋</li>
          <li>❌ 咖喱等香料</li>
        </ul>
        
        <h4>应对方法：</h4>
        <ul>
          <li>少量食用</li>
          <li>使用除臭剂</li>
          <li>搭配减少气味的食物</li>
        </ul>
        
        <h3>4. 刺激性食物（需避免）</h3>
        
        <h4>辛辣刺激：</h4>
        <ul>
          <li>❌ 辣椒、花椒</li>
          <li>❌ 生姜、芥末</li>
          <li>❌ 咖喱</li>
          <li>❌ 浓茶、浓咖啡</li>
          <li>❌ 烈酒</li>
        </ul>
        
        <h4>影响：</h4>
        <ul>
          <li>刺激肠道</li>
          <li>增加排泄次数</li>
          <li>可能引起腹痛</li>
          <li>影响造口周围皮肤</li>
        </ul>
        
        <h3>5. 导致腹泻的食物</h3>
        
        <h4>易导致腹泻：</h4>
        <ul>
          <li>⚠️ 生冷食物</li>
          <li>⚠️ 油腻食物</li>
          <li>⚠️ 过量水果</li>
          <li>⚠️ 冰淇淋、冷饮</li>
          <li>⚠️ 高糖食物</li>
          <li>⚠️ 咖啡、浓茶</li>
        </ul>
        
        <h4>对回肠造口影响特别大：</h4>
        <p>腹泻会导致脱水、电解质失衡，需特别注意。</p>
        
        <h3>6. 可能堵塞造口的食物</h3>
        
        <h4>高风险食物：</h4>
        <ul>
          <li>❌ 整粒玉米</li>
          <li>❌ 坚果（整颗）</li>
          <li>❌ 爆米花</li>
          <li>❌ 椰丝</li>
          <li>❌ 菠萝、橙子（连膜）</li>
          <li>❌ 芹菜（整条）</li>
        </ul>
        
        <h4>预防方法：</h4>
        <ul>
          <li>切碎、磨碎</li>
          <li>充分咀嚼</li>
          <li>少量食用</li>
          <li>多饮水</li>
        </ul>
        
        <h3>7. 其他需要注意的食物</h3>
        
        <h4>高脂肪食物：</h4>
        <ul>
          <li>⚠️ 肥肉、动物内脏</li>
          <li>⚠️ 油炸食品</li>
          <li>⚠️ 奶油蛋糕</li>
        </ul>
        <p>影响：不易消化，可能导致腹泻</p>
        
        <h4>高糖食物：</h4>
        <ul>
          <li>⚠️ 糖果、巧克力</li>
          <li>⚠️ 甜饮料</li>
          <li>⚠️ 蛋糕、甜点</li>
        </ul>
        <p>影响：可能导致腹泻，增加排泄</p>
        
        <div class="important-box">
          <strong>⚠️ 重要提醒：</strong>
          <p>食物反应因人而异！</p>
          <ul>
            <li>同一食物不同人反应不同</li>
            <li>通过饮食日记找出个人禁忌</li>
            <li>不要完全避免所有"禁忌"食物</li>
            <li>逐步尝试，找到平衡</li>
          </ul>
        </div>
        
        <div class="tip-box">
          <strong>💡 安全尝试新食物的方法：</strong>
          <ol>
            <li>选择在家、时间充裕时尝试</li>
            <li>每次只添加一种新食物</li>
            <li>从少量开始</li>
            <li>观察24小时反应</li>
            <li>记录在饮食日记中</li>
            <li>如无不适，可逐步增加</li>
          </ol>
        </div>', 
       540, 
       '["了解需要限制的食物及原因", "掌握产气和异味食物的识别", "学会安全尝试新食物的方法", "建立个性化的饮食禁忌清单"]')
      ON DUPLICATE KEY UPDATE title=title;
    `);
    console.log('✅ 课程4的3个章节添加成功\n');
    
    // 课程5：处理造口周围皮肤问题
    console.log('📚 添加课程5（处理造口周围皮肤问题）的章节...');
    await connection.query(`
      INSERT INTO course_chapters (course_id, chapter_order, title, content, duration, learning_points) VALUES
      (5, 1, '常见皮肤问题识别', 
       '<h2>造口周围皮肤问题</h2>
        <p>造口周围皮肤问题是造口患者最常见的并发症之一。及早识别和处理可以防止问题恶化，保护皮肤健康。</p>
        
        <h3>1. 正常皮肤状态</h3>
        <p><strong>健康的造口周围皮肤应该是：</strong></p>
        <ul>
          <li>✅ 颜色正常（与周围皮肤一致）</li>
          <li>✅ 表面光滑、完整</li>
          <li>✅ 无红肿、破损</li>
          <li>✅ 无疼痛、瘙痒</li>
          <li>✅ 无分泌物</li>
        </ul>
        
        <h3>2. 接触性皮炎</h3>
        
        <h4>症状识别：</h4>
        <ul>
          <li>🔴 皮肤发红</li>
          <li>💧 渗液、潮湿</li>
          <li>😖 疼痛、灼热感</li>
          <li>📐 边界清晰（与造口袋形状一致）</li>
        </ul>
        
        <h4>常见原因：</h4>
        <ul>
          <li>底盘开孔过大，排泄物接触皮肤</li>
          <li>造口袋渗漏</li>
          <li>清洁不当</li>
          <li>更换频率不当</li>
        </ul>
        
        <h4>严重程度分级：</h4>
        <ul>
          <li><strong>轻度</strong>：轻微发红，无破损</li>
          <li><strong>中度</strong>：明显发红，有渗液</li>
          <li><strong>重度</strong>：皮肤破溃、糜烂</li>
        </ul>
        
        <h3>3. 机械性损伤</h3>
        
        <h4>症状识别：</h4>
        <ul>
          <li>🩹 皮肤表层剥脱</li>
          <li>🔴 局部发红</li>
          <li>💧 轻微出血或渗液</li>
          <li>😫 疼痛感</li>
        </ul>
        
        <h4>常见原因：</h4>
        <ul>
          <li>频繁揭除造口袋</li>
          <li>揭除方法不当（用力撕扯）</li>
          <li>皮肤脆弱（老年人、激素使用者）</li>
          <li>粘性过强的底盘</li>
        </ul>
        
        <h3>4. 过敏性皮炎</h3>
        
        <h4>症状识别：</h4>
        <ul>
          <li>🔴 皮肤红肿</li>
          <li>😖 剧烈瘙痒</li>
          <li>🦠 小红疹、水疱</li>
          <li>📐 可能超出造口袋范围</li>
        </ul>
        
        <h4>常见原因：</h4>
        <ul>
          <li>对造口袋材料过敏</li>
          <li>对清洁用品过敏</li>
          <li>对皮肤保护产品过敏</li>
        </ul>
        
        <h3>5. 真菌感染</h3>
        
        <h4>症状识别：</h4>
        <ul>
          <li>🔴 皮肤潮红</li>
          <li>🦠 红色丘疹、脓疱</li>
          <li>😖 瘙痒、灼热感</li>
          <li>🌟 卫星状分布（周围有散在小疹）</li>
          <li>💧 皮肤潮湿、浸渍</li>
        </ul>
        
        <h4>易发因素：</h4>
        <ul>
          <li>皮肤长期潮湿</li>
          <li>糖尿病患者</li>
          <li>免疫力低下</li>
          <li>长期使用抗生素</li>
        </ul>
        
        <h3>6. 增生性病变</h3>
        
        <h4>假性上皮瘤样增生：</h4>
        <ul>
          <li>🔴 造口周围皮肤隆起</li>
          <li>🦠 呈疣状、乳头状</li>
          <li>💧 可能有分泌物</li>
          <li>😖 可能疼痛、出血</li>
        </ul>
        
        <h4>常见原因：</h4>
        <ul>
          <li>长期慢性刺激</li>
          <li>排泄物长期接触</li>
          <li>反复感染</li>
        </ul>
        
        <h3>7. 压疮</h3>
        
        <h4>症状识别：</h4>
        <ul>
          <li>🔴 局部皮肤发红、发紫</li>
          <li>🩹 皮肤破损、溃疡</li>
          <li>📐 常见于造口边缘</li>
          <li>😫 疼痛</li>
        </ul>
        
        <h4>常见原因：</h4>
        <ul>
          <li>底盘压力过大</li>
          <li>凸面底盘使用不当</li>
          <li>腰带过紧</li>
          <li>长期卧床</li>
        </ul>
        
        <h3>8. 识别技巧</h3>
        
        <h4>观察时机：</h4>
        <ul>
          <li>每次更换造口袋时</li>
          <li>感到不适时</li>
          <li>定期检查（每周）</li>
        </ul>
        
        <h4>观察方法：</h4>
        <ul>
          <li>在光线充足处</li>
          <li>使用小镜子帮助观察</li>
          <li>轻轻触摸感受</li>
          <li>拍照记录变化</li>
        </ul>
        
        <h4>需要记录的信息：</h4>
        <ul>
          <li>发现时间</li>
          <li>症状描述（颜色、范围、感觉）</li>
          <li>可能的原因</li>
          <li>采取的措施</li>
          <li>变化情况</li>
        </ul>
        
        <div class="warning-box">
          <strong>⚠️ 需要立即就医的情况：</strong>
          <ul>
            <li>大面积皮肤破溃</li>
            <li>持续出血不止</li>
            <li>剧烈疼痛</li>
            <li>有脓性分泌物</li>
            <li>发热</li>
            <li>皮肤变化迅速恶化</li>
          </ul>
        </div>
        
        <div class="tip-box">
          <strong>💡 预防建议：</strong>
          <ul>
            <li>保持皮肤清洁干燥</li>
            <li>选择合适的造口袋</li>
            <li>正确的揭除和粘贴技术</li>
            <li>及时更换造口袋</li>
            <li>定期检查皮肤状况</li>
          </ul>
        </div>', 
       600, 
       '["识别正常和异常的皮肤状态", "了解常见皮肤问题的症状和原因", "掌握皮肤观察的方法和时机", "知道何时需要寻求专业帮助"]'),
       
      (5, 2, '皮肤问题处理方法', 
       '<h2>造口周围皮肤问题的处理</h2>
        <p>正确的处理方法可以快速改善皮肤状况，预防问题加重。</p>
        
        <h3>1. 接触性皮炎处理</h3>
        
        <h4>基本处理步骤：</h4>
        <ol>
          <li><strong>找出原因并消除</strong>
            <ul>
              <li>检查底盘开孔大小</li>
              <li>检查是否渗漏</li>
              <li>评估更换频率</li>
            </ul>
          </li>
          <li><strong>清洁患处</strong>
            <ul>
              <li>用温水或生理盐水轻柔清洁</li>
              <li>不要使用刺激性清洁剂</li>
              <li>轻拍吸干，不要摩擦</li>
            </ul>
          </li>
          <li><strong>使用皮肤保护粉</strong>
            <ul>
              <li>薄薄撒一层在患处</li>
              <li>轻轻拍打使其附着</li>
              <li>吸去多余的粉末</li>
            </ul>
          </li>
          <li><strong>喷涂皮肤保护膜</strong>
            <ul>
              <li>在保护粉上喷涂</li>
              <li>等待完全干燥</li>
              <li>形成保护层</li>
            </ul>
          </li>
          <li><strong>粘贴造口袋</strong>
            <ul>
              <li>确保底盘开孔合适</li>
              <li>正确粘贴</li>
            </ul>
          </li>
        </ol>
        
        <h4>严重情况：</h4>
        <ul>
          <li>可使用造口护肤霜</li>
          <li>必要时短期使用激素类药膏（医生指导下）</li>
          <li>增加更换频率</li>
          <li>考虑更换造口袋类型</li>
        </ul>
        
        <h3>2. 机械性损伤处理</h3>
        
        <h4>处理步骤：</h4>
        <ol>
          <li><strong>立即停止刺激</strong>
            <ul>
              <li>改用低粘性底盘</li>
              <li>延长更换周期</li>
              <li>改进揭除技术</li>
            </ul>
          </li>
          <li><strong>促进愈合</strong>
            <ul>
              <li>保持创面清洁干燥</li>
              <li>使用皮肤保护粉</li>
              <li>使用皮肤保护膜</li>
            </ul>
          </li>
          <li><strong>预防再次损伤</strong>
            <ul>
              <li>学习正确的揭除方法</li>
              <li>使用除胶剂</li>
              <li>选择合适粘性的底盘</li>
            </ul>
          </li>
        </ol>
        
        <h3>3. 过敏性皮炎处理</h3>
        
        <h4>处理步骤：</h4>
        <ol>
          <li><strong>停用致敏产品</strong>
            <ul>
              <li>更换造口袋品牌</li>
              <li>停用可能致敏的护肤品</li>
              <li>使用低敏感产品</li>
            </ul>
          </li>
          <li><strong>抗过敏治疗</strong>
            <ul>
              <li>口服抗组胺药（医生指导）</li>
              <li>外用激素类药膏（短期）</li>
              <li>避免搔抓</li>
            </ul>
          </li>
          <li><strong>寻找替代产品</strong>
            <ul>
              <li>尝试不同材质的造口袋</li>
              <li>使用隔离保护膜</li>
              <li>咨询专科护士建议</li>
            </ul>
          </li>
        </ol>
        
        <h3>4. 真菌感染处理</h3>
        
        <h4>处理步骤：</h4>
        <ol>
          <li><strong>抗真菌治疗</strong>
            <ul>
              <li>使用抗真菌药粉（如达克宁粉）</li>
              <li>外用抗真菌药膏（如克霉唑）</li>
              <li>按医嘱完成疗程（通常2-4周）</li>
            </ul>
          </li>
          <li><strong>保持干燥</strong>
            <ul>
              <li>彻底清洁并干燥</li>
              <li>必要时用吹风机（冷风）</li>
              <li>使用皮肤保护粉吸收水分</li>
              <li>增加更换频率</li>
            </ul>
          </li>
          <li><strong>改善环境</strong>
            <ul>
              <li>穿透气衣物</li>
              <li>避免闷热潮湿</li>
              <li>控制血糖（糖尿病患者）</li>
            </ul>
          </li>
        </ol>
        
        <h4>用药方法：</h4>
        <ul>
          <li>薄薄涂抹抗真菌药</li>
          <li>等待完全干燥（15-20分钟）</li>
          <li>使用皮肤保护膜隔离</li>
          <li>粘贴造口袋</li>
        </ul>
        
        <h3>5. 增生性病变处理</h3>
        
        <h4>处理原则：</h4>
        <ul>
          <li><strong>消除刺激因素</strong>：确保底盘开孔合适</li>
          <li><strong>保护皮肤</strong>：使用皮肤保护粉和膜</li>
          <li><strong>医学治疗</strong>：硝酸银烧灼（医生操作）</li>
          <li><strong>外科处理</strong>：严重者手术切除</li>
        </ul>
        
        <h3>6. 压疮处理</h3>
        
        <h4>处理步骤：</h4>
        <ol>
          <li><strong>减轻压力</strong>
            <ul>
              <li>更换平面底盘</li>
              <li>松开腰带</li>
              <li>避免压迫</li>
            </ul>
          </li>
          <li><strong>促进愈合</strong>
            <ul>
              <li>使用伤口护理产品</li>
              <li>保持清洁</li>
              <li>避免摩擦</li>
            </ul>
          </li>
          <li><strong>重度压疮</strong>
            <ul>
              <li>需就医处理</li>
              <li>可能需要换药</li>
              <li>严重者需暂时不用造口袋</li>
            </ul>
          </li>
        </ol>
        
        <h3>7. 常用护肤产品</h3>
        
        <h4>皮肤保护粉：</h4>
        <ul>
          <li>吸收渗液</li>
          <li>保护破损皮肤</li>
          <li>促进愈合</li>
        </ul>
        
        <h4>皮肤保护膜：</h4>
        <ul>
          <li>形成保护层</li>
          <li>隔离刺激物</li>
          <li>增强底盘粘附</li>
        </ul>
        
        <h4>造口护肤霜：</h4>
        <ul>
          <li>滋润皮肤</li>
          <li>促进修复</li>
          <li>减轻炎症</li>
        </ul>
        
        <h4>抗真菌药物：</h4>
        <ul>
          <li>治疗真菌感染</li>
          <li>粉剂或膏剂</li>
          <li>需完成疗程</li>
        </ul>
        
        <div class="important-box">
          <strong>⚠️ 用药注意事项：</strong>
          <ul>
            <li>按说明书或医嘱使用</li>
            <li>注意药物干燥后再贴袋</li>
            <li>激素类药物不宜长期使用</li>
            <li>过敏立即停用</li>
            <li>效果不佳及时就医</li>
          </ul>
        </div>
        
        <div class="tip-box">
          <strong>💡 处理技巧：</strong>
          <ul>
            <li>早发现、早处理，效果更好</li>
            <li>不要自行使用多种药物混用</li>
            <li>记录处理过程和效果</li>
            <li>拍照对比变化</li>
            <li>不确定时咨询专业人员</li>
          </ul>
        </div>', 
       900, 
       '["掌握不同皮肤问题的处理方法", "了解常用护肤产品的使用", "学会基本的皮肤护理技能", "知道何时需要专业医疗帮助"]'),
       
      (5, 3, '预防措施和日常护理', 
       '<h2>皮肤问题的预防和护理</h2>
        <p>预防胜于治疗。良好的日常护理可以显著降低皮肤问题的发生率。</p>
        
        <h3>1. 正确选择造口袋</h3>
        
        <h4>底盘类型选择：</h4>
        <ul>
          <li><strong>平面底盘</strong>：适合凸起型造口</li>
          <li><strong>凸面底盘</strong>：适合平坦或回缩型造口</li>
          <li><strong>柔性底盘</strong>：适合皮肤敏感者</li>
          <li><strong>加强型底盘</strong>：适合易出汗者</li>
        </ul>
        
        <h4>粘性选择：</h4>
        <ul>
          <li><strong>标准粘性</strong>：正常皮肤</li>
          <li><strong>低粘性</strong>：敏感皮肤、老年人</li>
          <li><strong>高粘性</strong>：活动量大、易出汗</li>
        </ul>
        
        <h4>尺寸选择：</h4>
        <ul>
          <li>底盘开孔比造口直径大2-3mm</li>
          <li>过大：排泄物接触皮肤</li>
          <li>过小：压迫造口</li>
          <li>定期测量（术后3-6个月造口可能缩小）</li>
        </ul>
        
        <h3>2. 正确的更换技术</h3>
        
        <h4>揭除技巧：</h4>
        <ul>
          <li>✅ 缓慢揭除，保持低角度</li>
          <li>✅ 一手按压皮肤，一手揭除</li>
          <li>✅ 必要时用温水或除胶剂</li>
          <li>❌ 避免快速撕扯</li>
        </ul>
        
        <h4>清洁要点：</h4>
        <ul>
          <li>使用温水或生理盐水</li>
          <li>避免使用刺激性清洁剂</li>
          <li>轻柔擦拭，不要用力摩擦</li>
          <li>确保完全干燥</li>
        </ul>
        
        <h4>粘贴要点：</h4>
        <ul>
          <li>确保皮肤完全干燥</li>
          <li>无残留物质</li>
          <li>温度适宜</li>
          <li>正确的粘贴技术</li>
        </ul>
        
        <h3>3. 保持皮肤健康</h3>
        
        <h4>日常护理：</h4>
        <ul>
          <li><strong>清洁</strong>：每次更换时彻底清洁</li>
          <li><strong>干燥</strong>：确保皮肤完全干燥</li>
          <li><strong>保护</strong>：使用皮肤保护产品</li>
          <li><strong>观察</strong>：定期检查皮肤状况</li>
        </ul>
        
        <h4>使用皮肤保护膜：</h4>
        <ul>
          <li>每次更换前喷涂或涂抹</li>
          <li>等待完全干燥</li>
          <li>形成透明保护层</li>
          <li>增强底盘粘附</li>
          <li>保护皮肤不受刺激</li>
        </ul>
        
        <h4>防漏措施：</h4>
        <ul>
          <li>确保底盘完全贴合</li>
          <li>无气泡、翘边</li>
          <li>及时更换（不要等到渗漏）</li>
          <li>使用防漏膏填补凹陷</li>
        </ul>
        
        <h3>4. 合理的更换频率</h3>
        
        <h4>建议频率：</h4>
        <ul>
          <li><strong>一件式</strong>：1-3天</li>
          <li><strong>两件式底盘</strong>：3-5天</li>
          <li><strong>袋子</strong>：根据需要</li>
        </ul>
        
        <h4>需提前更换：</h4>
        <ul>
          <li>渗漏或即将渗漏</li>
          <li>边缘翘起</li>
          <li>皮肤不适</li>
          <li>有异味</li>
          <li>粘附力下降</li>
        </ul>
        
        <h4>不宜频繁更换：</h4>
        <ul>
          <li>频繁更换增加皮肤损伤风险</li>
          <li>除非必要，不要每天更换</li>
          <li>找到适合自己的更换周期</li>
        </ul>
        
        <h3>5. 环境管理</h3>
        
        <h4>控制湿度：</h4>
        <ul>
          <li>避免过度出汗</li>
          <li>炎热天气增加更换频率</li>
          <li>使用吸汗产品</li>
          <li>穿透气衣物</li>
        </ul>
        
        <h4>避免摩擦：</h4>
        <ul>
          <li>穿宽松衣物</li>
          <li>避免紧身衣裤</li>
          <li>使用造口袋套</li>
          <li>睡觉时注意姿势</li>
        </ul>
        
        <h3>6. 生活方式调整</h3>
        
        <h4>饮食调节：</h4>
        <ul>
          <li>避免导致腹泻的食物</li>
          <li>控制排泄次数</li>
          <li>减少对皮肤的刺激</li>
        </ul>
        
        <h4>活动管理：</h4>
        <ul>
          <li>运动前检查造口袋</li>
          <li>必要时使用腰带固定</li>
          <li>避免剧烈碰撞</li>
          <li>运动后及时清洁</li>
        </ul>
        
        <h4>心理调适：</h4>
        <ul>
          <li>压力和焦虑可能影响皮肤</li>
          <li>保持良好心态</li>
          <li>充足睡眠</li>
          <li>适度放松</li>
        </ul>
        
        <h3>7. 特殊人群注意事项</h3>
        
        <h4>老年人：</h4>
        <ul>
          <li>皮肤更脆弱</li>
          <li>使用低粘性底盘</li>
          <li>更加轻柔操作</li>
          <li>增加营养</li>
        </ul>
        
        <h4>糖尿病患者：</h4>
        <ul>
          <li>控制血糖</li>
          <li>加强皮肤检查</li>
          <li>预防感染</li>
          <li>伤口愈合慢，及早处理</li>
        </ul>
        
        <h4>放化疗患者：</h4>
        <ul>
          <li>皮肤敏感</li>
          <li>使用温和产品</li>
          <li>加强保护</li>
          <li>密切观察</li>
        </ul>
        
        <h3>8. 定期评估和调整</h3>
        
        <h4>自我评估：</h4>
        <ul>
          <li>每周检查皮肤状况</li>
          <li>记录任何变化</li>
          <li>拍照记录</li>
          <li>评估护理方法是否有效</li>
        </ul>
        
        <h4>专业评估：</h4>
        <ul>
          <li>定期复查（3-6个月）</li>
          <li>咨询造口专科护士</li>
          <li>评估造口袋是否合适</li>
          <li>调整护理方案</li>
        </ul>
        
        <h3>9. 预防用品清单</h3>
        
        <h4>基础用品：</h4>
        <ul>
          <li>✅ 合适的造口袋</li>
          <li>✅ 皮肤保护膜</li>
          <li>✅ 温和清洁用品</li>
          <li>✅ 除胶剂</li>
        </ul>
        
        <h4>高风险者额外准备：</h4>
        <ul>
          <li>✅ 皮肤保护粉</li>
          <li>✅ 防漏膏</li>
          <li>✅ 造口护肤霜</li>
          <li>✅ 抗真菌药粉（备用）</li>
        </ul>
        
        <div class="success-box">
          <strong>✅ 健康皮肤的标志：</strong>
          <ul>
            <li>颜色正常，与周围皮肤一致</li>
            <li>表面光滑，无破损</li>
            <li>无红肿、渗液</li>
            <li>无瘙痒、疼痛</li>
            <li>造口袋粘附良好</li>
            <li>很少或没有渗漏</li>
          </ul>
        </div>
        
        <div class="tip-box">
          <strong>💡 预防口诀：</strong>
          <ul>
            <li>选对袋，用对法</li>
            <li>轻揭除，慢粘贴</li>
            <li>勤观察，早处理</li>
            <li>保干燥，防渗漏</li>
          </ul>
        </div>', 
       900, 
       '["掌握预防皮肤问题的关键措施", "了解日常皮肤护理的方法", "学会选择合适的护理产品", "建立科学的护理习惯"]')
      ON DUPLICATE KEY UPDATE title=title;
    `);
    console.log('✅ 课程5的3个章节添加成功\n');
    
    // 更新课程总时长
    console.log('🔄 更新课程总时长...');
    await connection.query(`
      UPDATE courses c
      SET c.duration = (
        SELECT IFNULL(SUM(duration), 0)
        FROM course_chapters
        WHERE course_id = c.id
      )
      WHERE c.id IN (4, 5);
    `);
    console.log('✅ 课程总时长更新成功\n');
    
    // 显示统计
    const [stats] = await connection.query(`
      SELECT 
        c.id,
        c.title as course_title,
        COUNT(cc.id) as chapter_count,
        SUM(cc.duration) as total_duration
      FROM courses c
      LEFT JOIN course_chapters cc ON c.id = cc.course_id
      WHERE c.id IN (4, 5)
      GROUP BY c.id
      ORDER BY c.id
    `);
    
    console.log('📊 课程章节统计：');
    stats.forEach(row => {
      console.log(`  ${row.course_title}：${row.chapter_count}个章节，总时长 ${Math.ceil(row.total_duration / 60)}分钟`);
    });
    console.log();
    
    // 显示总体统计
    const [totalStats] = await connection.query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(cc.id) as total_chapters,
        SUM(cc.duration) as total_duration
      FROM courses c
      LEFT JOIN course_chapters cc ON c.id = cc.course_id
      WHERE cc.id IS NOT NULL
    `);
    
    console.log('📈 总体统计：');
    console.log(`  已完善课程数：${totalStats[0].total_courses}门`);
    console.log(`  总章节数：${totalStats[0].total_chapters}个`);
    console.log(`  总学习时长：${Math.ceil(totalStats[0].total_duration / 60)}分钟`);
    console.log();
    
    console.log('='.repeat(60));
    console.log('🎉 所有课程章节内容添加完成！');
    console.log('='.repeat(60));
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
  addFinalCourseChapters();
}

module.exports = addFinalCourseChapters;

