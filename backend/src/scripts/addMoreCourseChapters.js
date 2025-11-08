/**
 * 为剩余课程添加详细章节内容
 * 课程3: 造口袋更换步骤
 * 课程4: 造口患者饮食原则
 * 课程5: 处理造口周围皮肤问题
 */

const mysql = require('mysql2/promise');

async function addMoreCourseChapters() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 开始添加更多课程章节内容...\n');
    
    // 数据库配置
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
    
    // 课程3：造口袋更换步骤
    console.log('📚 添加课程3（造口袋更换步骤）的章节...');
    await connection.query(`
      INSERT INTO course_chapters (course_id, chapter_order, title, content, duration, learning_points) VALUES
      (3, 1, '更换前的准备工作', 
       '<h2>准备工作的重要性</h2>
        <p>充分的准备是成功更换造口袋的关键。良好的准备不仅能提高更换效率，还能减少感染风险，保护造口周围皮肤。</p>
        
        <h3>1. 用物准备</h3>
        <h4>必需品：</h4>
        <ul>
          <li><strong>新造口袋</strong>：确认尺寸合适（提前测量造口直径）</li>
          <li><strong>清洁用品</strong>：温水、软质纱布或造口清洁湿巾</li>
          <li><strong>皮肤保护用品</strong>：皮肤保护膜、防漏膏（如需要）</li>
          <li><strong>测量卡</strong>：用于测量造口尺寸</li>
          <li><strong>剪刀</strong>：造口专用剪刀（如使用可剪型底盘）</li>
          <li><strong>垃圾袋</strong>：密封垃圾袋用于处置旧造口袋</li>
        </ul>
        
        <h4>可选品：</h4>
        <ul>
          <li>一次性手套（保持清洁）</li>
          <li>小镜子（观察造口后方）</li>
          <li>纸巾或毛巾（吸收水分）</li>
          <li>除臭剂（如需要）</li>
        </ul>
        
        <h3>2. 环境准备</h3>
        <ul>
          <li><strong>选择合适的地点</strong>：卫生间或私密房间</li>
          <li><strong>确保光线充足</strong>：便于观察造口状态</li>
          <li><strong>准备平稳的台面</strong>：放置用物</li>
          <li><strong>保持适宜温度</strong>：避免过冷或过热</li>
          <li><strong>保证隐私</strong>：避免被打扰</li>
        </ul>
        
        <h3>3. 时机选择</h3>
        <p><strong>最佳更换时间：</strong></p>
        <ul>
          <li>早晨起床后（排泄物较少）</li>
          <li>饭前1-2小时</li>
          <li>避开排泄高峰期</li>
          <li>造口袋1/3-1/2满时</li>
        </ul>
        
        <h3>4. 个人准备</h3>
        <ul>
          <li>洗手：用肥皂和温水彻底清洁双手</li>
          <li>穿着：选择易于操作的宽松衣物</li>
          <li>心理准备：保持平静、自信的心态</li>
          <li>时间充裕：预留足够时间，不要匆忙</li>
        </ul>
        
        <div class="tip-box">
          <strong>💡 专业建议：</strong>
          <p>建议在家中多个地方（如主卧卫生间、次卧等）都准备一套完整的更换用品，以便在任何时候都能及时更换。外出时也要随身携带应急更换包。</p>
        </div>
        
        <h3>5. 检查清单</h3>
        <p>更换前请确认：</p>
        <ul>
          <li>✓ 所有用物已准备齐全</li>
          <li>✓ 新造口袋尺寸已确认</li>
          <li>✓ 环境整洁、光线充足</li>
          <li>✓ 双手已清洁</li>
          <li>✓ 时间充裕、心情平静</li>
        </ul>', 
       600, 
       '["掌握完整的用物准备清单", "了解最佳更换时机的选择", "学会创造适宜的更换环境", "建立正确的更换准备流程"]'),
       
      (3, 2, '揭除旧造口袋', 
       '<h2>正确的揭除方法</h2>
        <p>正确揭除旧造口袋是保护皮肤的关键步骤。不当的揭除方式可能导致皮肤损伤、红肿甚至溃破。</p>
        
        <h3>1. 揭除前准备</h3>
        <ul>
          <li>先将造口袋中的排泄物倾倒到马桶中</li>
          <li>用纸巾擦拭造口袋开口</li>
          <li>准备好垃圾袋</li>
          <li>确保双手清洁或戴手套</li>
        </ul>
        
        <h3>2. 揭除步骤</h3>
        <h4>步骤1：从边缘开始</h4>
        <p>用一只手按住造口周围的皮肤，另一只手从底盘边缘轻轻向上揭起。</p>
        
        <h4>步骤2：缓慢揭除</h4>
        <ul>
          <li>自上而下或自下而上缓慢揭除</li>
          <li><strong>不要快速撕扯</strong>：会损伤皮肤</li>
          <li><strong>保持低角度</strong>：与皮肤呈30-45度角揭除</li>
          <li><strong>一手按压皮肤</strong>：防止皮肤被拉扯</li>
        </ul>
        
        <h4>步骤3：遇到粘连紧密处</h4>
        <p>如果底盘粘附很紧：</p>
        <ul>
          <li>用温水湿润边缘</li>
          <li>等待30秒-1分钟</li>
          <li>使用除胶剂（如有）</li>
          <li>继续缓慢揭除</li>
        </ul>
        
        <h3>3. 不同类型造口袋的揭除</h3>
        
        <h4>一件式造口袋：</h4>
        <ul>
          <li>整体揭除，包括底盘和袋子</li>
          <li>特别注意保护皮肤</li>
          <li>揭除后立即清洁</li>
        </ul>
        
        <h4>两件式造口袋：</h4>
        <ul>
          <li><strong>仅更换袋子</strong>：先取下袋子，保留底盘</li>
          <li><strong>更换底盘</strong>：取下袋子后再揭除底盘</li>
          <li>底盘通常可保留3-5天</li>
        </ul>
        
        <h3>4. 特殊情况处理</h3>
        
        <h4>渗漏情况：</h4>
        <ul>
          <li>更加小心揭除，避免污染周围皮肤</li>
          <li>立即清洁受污染区域</li>
          <li>检查皮肤是否有损伤</li>
        </ul>
        
        <h4>皮肤发红或破损：</h4>
        <ul>
          <li>极其轻柔地揭除</li>
          <li>必要时用温水湿敷软化</li>
          <li>避免再次损伤</li>
        </ul>
        
        <h3>5. 揭除后处理</h3>
        <ul>
          <li>将旧造口袋放入密封垃圾袋</li>
          <li>不要冲入马桶（会堵塞）</li>
          <li>按生活垃圾处理</li>
          <li>立即清洁双手</li>
        </ul>
        
        <div class="warning-box">
          <strong>⚠️ 常见错误：</strong>
          <ul>
            <li>❌ 快速撕扯：会损伤皮肤</li>
            <li>❌ 不按压皮肤：皮肤被拉扯</li>
            <li>❌ 角度过大：增加皮肤压力</li>
            <li>❌ 强行揭除：可能造成皮肤破损</li>
          </ul>
        </div>
        
        <div class="tip-box">
          <strong>💡 专业技巧：</strong>
          <p>如果经常感觉揭除困难，可以尝试：</p>
          <ul>
            <li>选择粘性较低的底盘</li>
            <li>缩短更换周期</li>
            <li>使用专业除胶剂</li>
            <li>更换前用温水湿敷边缘</li>
          </ul>
        </div>', 
       720, 
       '["掌握正确的揭除技巧和方法", "了解一件式和两件式造口袋的揭除差异", "学会处理揭除过程中的特殊情况", "避免常见的揭除错误"]'),
       
      (3, 3, '清洁造口周围', 
       '<h2>造口及周围皮肤清洁</h2>
        <p>正确的清洁是预防皮肤并发症、保证造口袋良好粘附的基础。清洁不当可能导致皮肤炎症、感染或造口袋渗漏。</p>
        
        <h3>1. 清洁用品选择</h3>
        <h4>推荐用品：</h4>
        <ul>
          <li><strong>温水</strong>：最安全、最温和的清洁方式</li>
          <li><strong>软质纱布或毛巾</strong>：柔软、吸水性好</li>
          <li><strong>造口专用清洁湿巾</strong>：方便、卫生</li>
          <li><strong>温和无刺激的清洁液</strong>：pH值中性（如有需要）</li>
        </ul>
        
        <h4>避免使用：</h4>
        <ul>
          <li>❌ 含酒精的清洁剂：刺激皮肤</li>
          <li>❌ 香皂、沐浴露：留下油脂，影响粘附</li>
          <li>❌ 消毒剂、碘伏：过度刺激</li>
          <li>❌ 粗糙的毛巾：可能损伤皮肤</li>
        </ul>
        
        <h3>2. 清洁步骤</h3>
        
        <h4>步骤1：准备清洁用品</h4>
        <ul>
          <li>准备温水（约37-40°C，接近体温）</li>
          <li>准备软质纱布或清洁湿巾</li>
          <li>准备干燥的纱布或毛巾</li>
        </ul>
        
        <h4>步骤2：清洁造口</h4>
        <ul>
          <li>用湿润的纱布轻轻擦拭造口表面</li>
          <li><strong>方向</strong>：由内向外，环形擦拭</li>
          <li><strong>力度</strong>：轻柔，不要用力擦拭</li>
          <li><strong>注意</strong>：造口黏膜可能轻微出血，属正常现象</li>
        </ul>
        
        <h4>步骤3：清洁周围皮肤</h4>
        <ul>
          <li>清洁造口周围5-10cm范围的皮肤</li>
          <li>去除残留的胶质、排泄物</li>
          <li>特别注意皱褶处</li>
          <li>用清水反复擦拭至干净</li>
        </ul>
        
        <h4>步骤4：检查皮肤状况</h4>
        <p>清洁后仔细观察：</p>
        <ul>
          <li>造口颜色（正常为红色或粉红色）</li>
          <li>皮肤完整性（有无破损）</li>
          <li>有无红肿、溃破</li>
          <li>有无异常分泌物</li>
        </ul>
        
        <h4>步骤5：充分干燥</h4>
        <ul>
          <li>用干燥纱布轻拍吸干水分</li>
          <li><strong>不要摩擦</strong>：使用轻拍方式</li>
          <li>确保完全干燥（特别是皱褶处）</li>
          <li>必要时可用冷风吹干（保持距离）</li>
        </ul>
        
        <h3>3. 特殊情况处理</h3>
        
        <h4>残留胶质难以去除：</h4>
        <ul>
          <li>用温水湿敷2-3分钟</li>
          <li>使用专用除胶剂</li>
          <li>轻轻擦拭，不要强行去除</li>
        </ul>
        
        <h4>造口有少量出血：</h4>
        <ul>
          <li>属正常现象，不必惊慌</li>
          <li>轻柔按压止血</li>
          <li>等待血止后再粘贴</li>
        </ul>
        
        <h4>皮肤有破损：</h4>
        <ul>
          <li>用生理盐水清洁</li>
          <li>使用造口护肤粉</li>
          <li>待干燥后再粘贴</li>
        </ul>
        
        <h3>4. 清洁频率</h3>
        <ul>
          <li><strong>更换造口袋时</strong>：必须清洁</li>
          <li><strong>渗漏时</strong>：立即清洁</li>
          <li><strong>皮肤不适时</strong>：增加清洁频率</li>
          <li><strong>日常</strong>：无需额外清洁</li>
        </ul>
        
        <div class="tip-box">
          <strong>💡 清洁小技巧：</strong>
          <ul>
            <li>清洁时可用小镜子帮助观察背侧</li>
            <li>家人协助时效果更好</li>
            <li>外出时携带清洁湿巾备用</li>
            <li>清洁后等待3-5分钟再粘贴，确保完全干燥</li>
          </ul>
        </div>
        
        <div class="important-box">
          <strong>⚠️ 重要提醒：</strong>
          <p>清洁是预防皮肤并发症的关键！不要因为害怕或嫌麻烦而马虎清洁。良好的清洁习惯可以显著降低皮肤问题的发生率。</p>
        </div>', 
       900, 
       '["掌握正确的清洁方法和步骤", "了解合适的清洁用品选择", "学会检查造口和皮肤状况", "掌握皮肤干燥的重要性和方法"]'),
       
      (3, 4, '粘贴新造口袋', 
       '<h2>正确粘贴造口袋</h2>
        <p>正确的粘贴技术是防止渗漏、保护皮肤的关键。粘贴不当可能导致渗漏、皮肤损伤或造口袋提前脱落。</p>
        
        <h3>1. 粘贴前准备</h3>
        
        <h4>确认皮肤状态：</h4>
        <ul>
          <li>✓ 皮肤完全干燥</li>
          <li>✓ 无残留胶质</li>
          <li>✓ 无明显破损</li>
          <li>✓ 温度适宜</li>
        </ul>
        
        <h4>准备造口袋：</h4>
        <ul>
          <li>取出新造口袋</li>
          <li>检查有效期</li>
          <li>检查包装完整性</li>
          <li>放置室温（底盘会更柔软）</li>
        </ul>
        
        <h3>2. 测量和剪裁（可剪型底盘）</h3>
        
        <h4>测量造口尺寸：</h4>
        <ul>
          <li>使用造口测量卡</li>
          <li>测量造口最宽处直径</li>
          <li>记录准确尺寸</li>
          <li>注意：造口在术后3-6个月内可能缩小</li>
        </ul>
        
        <h4>确定开孔大小：</h4>
        <ul>
          <li><strong>标准</strong>：比造口直径大2-3mm</li>
          <li>过大：排泄物接触皮肤</li>
          <li>过小：压迫造口</li>
        </ul>
        
        <h4>剪裁底盘：</h4>
        <ul>
          <li>在底盘背面标记</li>
          <li>使用专用造口剪刀</li>
          <li>剪出圆滑的开口</li>
          <li>检查边缘是否光滑</li>
        </ul>
        
        <h3>3. 涂抹保护产品（如需要）</h3>
        
        <h4>皮肤保护膜：</h4>
        <ul>
          <li>喷洒或涂抹在皮肤上</li>
          <li>等待完全干燥（约30秒）</li>
          <li>形成透明保护层</li>
        </ul>
        
        <h4>防漏膏/条：</h4>
        <ul>
          <li>涂抹在造口周围</li>
          <li>填平皱褶和凹陷</li>
          <li>创造平坦的粘贴面</li>
        </ul>
        
        <h3>4. 粘贴步骤</h3>
        
        <h4>步骤1：揭开离型纸</h4>
        <ul>
          <li>小心揭开底盘上的保护纸</li>
          <li>避免触碰粘胶面</li>
          <li>保持底盘清洁</li>
        </ul>
        
        <h4>步骤2：对准位置</h4>
        <ul>
          <li>将底盘开口对准造口</li>
          <li>确保造口居中</li>
          <li>开口边缘距造口2-3mm</li>
          <li>底盘方向正确（两件式注意扣环位置）</li>
        </ul>
        
        <h4>步骤3：从下向上粘贴</h4>
        <ul>
          <li><strong>先粘下方</strong>：底盘下缘先贴合</li>
          <li><strong>轻轻按压</strong>：从中间向外排气</li>
          <li><strong>逐渐向上</strong>：慢慢贴合至顶部</li>
          <li><strong>避免气泡</strong>：边贴边排除气泡</li>
        </ul>
        
        <h4>步骤4：加压固定</h4>
        <ul>
          <li>用手掌在底盘上轻压</li>
          <li>保持30秒-1分钟</li>
          <li>体温会活化粘胶</li>
          <li>增强粘附力</li>
        </ul>
        
        <h4>步骤5：连接袋子（两件式）</h4>
        <ul>
          <li>将袋子扣环对准底盘扣环</li>
          <li>从下向上扣合</li>
          <li>听到"咔嗒"声确认扣紧</li>
          <li>检查连接是否牢固</li>
        </ul>
        
        <h3>5. 粘贴后检查</h3>
        
        <h4>立即检查：</h4>
        <ul>
          <li>✓ 底盘完全贴合，无气泡</li>
          <li>✓ 造口在开口中心</li>
          <li>✓ 边缘无翘起</li>
          <li>✓ 袋子连接牢固（两件式）</li>
        </ul>
        
        <h4>功能检查：</h4>
        <ul>
          <li>轻轻拉动袋子，检查是否牢固</li>
          <li>活动身体，感受舒适度</li>
          <li>观察是否有渗漏迹象</li>
        </ul>
        
        <h3>6. 不同造口类型的粘贴要点</h3>
        
        <h4>凸起型造口：</h4>
        <ul>
          <li>使用平面底盘</li>
          <li>确保底盘与皮肤完全贴合</li>
        </ul>
        
        <h4>平坦/回缩型造口：</h4>
        <ul>
          <li>使用凸面底盘</li>
          <li>配合腰带固定</li>
          <li>必要时使用防漏膏填补</li>
        </ul>
        
        <h4>不规则造口：</h4>
        <ul>
          <li>使用可塑型底盘</li>
          <li>用手塑形贴合造口</li>
          <li>加强防漏措施</li>
        </ul>
        
        <h3>7. 粘贴后注意事项</h3>
        <ul>
          <li>粘贴后等待5-10分钟再活动</li>
          <li>避免立即弯腰或剧烈运动</li>
          <li>24小时内避免洗澡（让粘胶充分固定）</li>
          <li>穿着宽松衣物，不要压迫</li>
        </ul>
        
        <div class="tip-box">
          <strong>💡 提高粘附力的技巧：</strong>
          <ul>
            <li>粘贴前用吹风机（冷风）吹干皮肤</li>
            <li>粘贴前让底盘恢复室温</li>
            <li>粘贴后用手掌体温温热底盘</li>
            <li>使用腰带增加固定性</li>
          </ul>
        </div>
        
        <div class="success-box">
          <strong>✅ 成功粘贴的标志：</strong>
          <ul>
            <li>底盘完全贴合，无气泡</li>
            <li>边缘无翘起</li>
            <li>活动自如，无不适感</li>
            <li>24小时内无渗漏</li>
          </ul>
        </div>', 
       1080, 
       '["掌握正确的测量和剪裁方法", "学会正确的粘贴技巧和步骤", "了解不同造口类型的粘贴要点", "掌握提高粘附力的技巧"]'),
       
      (3, 5, '更换注意事项', 
       '<h2>更换过程中的注意事项</h2>
        <p>注意细节可以避免常见问题，提高更换成功率，保护皮肤健康。</p>
        
        <h3>1. 频率把握</h3>
        
        <h4>推荐更换频率：</h4>
        <ul>
          <li><strong>一件式</strong>：每1-3天更换一次</li>
          <li><strong>两件式底盘</strong>：每3-5天更换一次</li>
          <li><strong>两件式袋子</strong>：每天或根据需要更换</li>
          <li><strong>尿路造口袋</strong>：每3-7天更换一次</li>
        </ul>
        
        <h4>需要提前更换的情况：</h4>
        <ul>
          <li>渗漏或即将渗漏</li>
          <li>底盘边缘翘起</li>
          <li>皮肤瘙痒、疼痛</li>
          <li>有异味产生</li>
          <li>粘附力明显下降</li>
        </ul>
        
        <h3>2. 时间管理</h3>
        
        <h4>最佳更换时间：</h4>
        <ul>
          <li><strong>早晨</strong>：起床后，排泄物较少</li>
          <li><strong>饭前</strong>：1-2小时，肠道活动较少</li>
          <li><strong>安静时刻</strong>：不会被打扰</li>
          <li><strong>有充足时间</strong>：不要赶时间</li>
        </ul>
        
        <h4>避免的时间：</h4>
        <ul>
          <li>❌ 饭后立即更换</li>
          <li>❌ 腹泻或排泄频繁时</li>
          <li>❌ 匆忙出门前</li>
          <li>❌ 疲劳或情绪不佳时</li>
        </ul>
        
        <h3>3. 环境要求</h3>
        
        <h4>理想环境：</h4>
        <ul>
          <li>温度适宜（20-25°C）</li>
          <li>干燥、通风</li>
          <li>光线充足</li>
          <li>隐私保护</li>
          <li>水源便利</li>
        </ul>
        
        <h4>特殊环境应对：</h4>
        <ul>
          <li><strong>公共场所</strong>：选择无障碍卫生间</li>
          <li><strong>旅行时</strong>：提前规划，携带完整用品</li>
          <li><strong>炎热天气</strong>：注意防汗，可能需增加更换频率</li>
          <li><strong>寒冷天气</strong>：保持室温，底盘温热后再贴</li>
        </ul>
        
        <h3>4. 安全注意事项</h3>
        
        <h4>预防感染：</h4>
        <ul>
          <li>更换前后彻底洗手</li>
          <li>使用清洁的用品</li>
          <li>及时处理废弃物</li>
          <li>保持用品存放清洁</li>
        </ul>
        
        <h4>预防皮肤损伤：</h4>
        <ul>
          <li>轻柔揭除，不要用力撕扯</li>
          <li>及时清洁排泄物</li>
          <li>保持皮肤干燥</li>
          <li>使用皮肤保护产品</li>
        </ul>
        
        <h4>预防渗漏：</h4>
        <ul>
          <li>确保皮肤完全干燥</li>
          <li>底盘尺寸合适</li>
          <li>无气泡、翘边</li>
          <li>及时倾倒或更换</li>
        </ul>
        
        <h3>5. 心理调适</h3>
        
        <h4>建立信心：</h4>
        <ul>
          <li>多次练习后会熟练</li>
          <li>允许自己犯错和学习</li>
          <li>记录成功经验</li>
          <li>相信自己能做好</li>
        </ul>
        
        <h4>应对尴尬：</h4>
        <ul>
          <li>更换是正常护理行为</li>
          <li>选择私密空间</li>
          <li>准备充分可避免意外</li>
          <li>家人支持很重要</li>
        </ul>
        
        <h3>6. 外出应急准备</h3>
        
        <h4>外出包必备：</h4>
        <ul>
          <li>✓ 备用造口袋（2-3套）</li>
          <li>✓ 清洁湿巾</li>
          <li>✓ 密封垃圾袋</li>
          <li>✓ 皮肤保护产品</li>
          <li>✓ 纸巾</li>
          <li>✓ 一次性手套</li>
        </ul>
        
        <h4>应急处理：</h4>
        <ul>
          <li>发现渗漏立即处理</li>
          <li>寻找合适的更换场所</li>
          <li>保持冷静和快速</li>
          <li>必要时寻求帮助</li>
        </ul>
        
        <h3>7. 常见问题预防</h3>
        
        <h4>气泡问题：</h4>
        <ul>
          <li>粘贴时从中心向外排气</li>
          <li>确保皮肤干燥无汗</li>
          <li>使用防漏膏填平凹陷</li>
        </ul>
        
        <h4>边缘翘起：</h4>
        <ul>
          <li>充分加压底盘边缘</li>
          <li>避免底盘过大</li>
          <li>检查是否有汗水</li>
        </ul>
        
        <h4>频繁渗漏：</h4>
        <ul>
          <li>检查开孔大小</li>
          <li>评估底盘类型是否合适</li>
          <li>考虑使用凸面底盘</li>
          <li>咨询专业护士</li>
        </ul>
        
        <h3>8. 寻求帮助</h3>
        
        <h4>何时需要帮助：</h4>
        <ul>
          <li>连续多次更换失败</li>
          <li>皮肤问题严重</li>
          <li>频繁渗漏无法控制</li>
          <li>心理压力过大</li>
        </ul>
        
        <h4>可以求助：</h4>
        <ul>
          <li>造口专科护士</li>
          <li>主治医生</li>
          <li>造口用品供应商</li>
          <li>造口病友协会</li>
          <li>家人和朋友</li>
        </ul>
        
        <div class="tip-box">
          <strong>💡 经验总结：</strong>
          <ul>
            <li>更换是一项需要学习的技能</li>
            <li>熟能生巧，不要气馁</li>
            <li>记录自己的最佳方案</li>
            <li>定期评估和改进</li>
          </ul>
        </div>
        
        <div class="success-story">
          <h4>💪 康复经验分享</h4>
          <p>张先生：刚开始更换时很慌乱，经常渗漏。后来在护士指导下，制定了详细的更换清单，每一步都认真执行。现在不仅能独立完成，而且很少出现问题。关键是不要急，细心和耐心最重要！</p>
        </div>', 
       900, 
       '["了解合理的更换频率和时机", "掌握安全注意事项和预防措施", "学会应对特殊情况和环境", "建立正确的心理态度"]')
      ON DUPLICATE KEY UPDATE title=title;
    `);
    console.log('✅ 课程3的5个章节添加成功\n');
    
    console.log('='.repeat(60));
    console.log('🎉 更多课程章节添加完成！\n');
    
    // 更新课程总时长
    console.log('🔄 更新课程总时长...');
    await connection.query(`
      UPDATE courses c
      SET c.duration = (
        SELECT IFNULL(SUM(duration), 0)
        FROM course_chapters
        WHERE course_id = c.id
      )
      WHERE c.id = 3;
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
      WHERE c.id = 3
      GROUP BY c.id
    `);
    
    console.log('📊 课程章节统计：');
    stats.forEach(row => {
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
  addMoreCourseChapters();
}

module.exports = addMoreCourseChapters;

