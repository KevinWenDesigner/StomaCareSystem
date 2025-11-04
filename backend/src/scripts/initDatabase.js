const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库初始化脚本
async function initDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始初始化数据库...\n');
    
    // 创建连接（不指定数据库）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      timezone: '+08:00'
    });
    
    const dbName = process.env.DB_NAME || 'stoma_care_db';
    
    // 创建数据库（如果不存在）
    console.log(`📦 创建数据库: ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // 选择数据库
    await connection.query(`USE ${dbName}`);
    console.log('✅ 数据库创建成功\n');
    
    // 创建用户表（微信用户）
    console.log('📝 创建用户表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
        union_id VARCHAR(100) COMMENT '微信unionid',
        session_key VARCHAR(100) COMMENT '会话密钥',
        nickname VARCHAR(50) COMMENT '昵称',
        avatar_url VARCHAR(255) COMMENT '头像URL',
        gender TINYINT DEFAULT 0 COMMENT '性别：0-未知,1-男,2-女',
        phone VARCHAR(20) COMMENT '手机号',
        user_type ENUM('patient', 'nurse', 'admin') DEFAULT 'patient' COMMENT '用户类型',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_openid (openid),
        INDEX idx_user_type (user_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
    `);
    
    // 创建患者信息表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '关联用户ID',
        name VARCHAR(50) NOT NULL COMMENT '姓名',
        id_card VARCHAR(18) COMMENT '身份证号',
        birth_date DATE COMMENT '出生日期',
        gender ENUM('male', 'female') NOT NULL COMMENT '性别',
        phone VARCHAR(20) COMMENT '联系电话',
        address VARCHAR(200) COMMENT '地址',
        stoma_type VARCHAR(50) COMMENT '造口类型',
        surgery_date DATE COMMENT '手术日期',
        surgery_hospital VARCHAR(100) COMMENT '手术医院',
        primary_disease VARCHAR(100) COMMENT '原发疾病',
        nurse_id INT COMMENT '负责护士ID',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_nurse_id (nurse_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='患者信息表';
    `);
    
    // 创建护士信息表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS nurses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '关联用户ID',
        name VARCHAR(50) NOT NULL COMMENT '姓名',
        employee_id VARCHAR(50) UNIQUE COMMENT '工号',
        phone VARCHAR(20) COMMENT '联系电话',
        department VARCHAR(100) COMMENT '科室',
        title VARCHAR(50) COMMENT '职称',
        hospital VARCHAR(100) COMMENT '所属医院',
        specialty TEXT COMMENT '专业特长',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_employee_id (employee_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='护士信息表';
    `);
    
    // 创建AI评估记录表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL COMMENT '患者ID',
        image_url VARCHAR(255) NOT NULL COMMENT '造口图片URL',
        assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评估时间',
        ai_result JSON COMMENT 'AI分析结果',
        stoma_color VARCHAR(50) COMMENT '造口颜色',
        stoma_size VARCHAR(50) COMMENT '造口大小',
        skin_condition VARCHAR(50) COMMENT '周围皮肤状况',
        risk_level ENUM('low', 'medium', 'high') COMMENT '风险等级',
        suggestions TEXT COMMENT '护理建议',
        nurse_review TINYINT DEFAULT 0 COMMENT '护士是否已查看',
        nurse_comment TEXT COMMENT '护士备注',
        reviewed_at DATETIME COMMENT '查看时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_patient_id (patient_id),
        INDEX idx_assessment_date (assessment_date),
        INDEX idx_risk_level (risk_level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI评估记录表';
    `);
    
    // 创建症状日记表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS symptom_diaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL COMMENT '患者ID',
        diary_date DATE NOT NULL COMMENT '日记日期',
        output_volume INT COMMENT '排泄物量(ml)',
        output_type VARCHAR(50) COMMENT '排泄物性状',
        output_color VARCHAR(50) COMMENT '排泄物颜色',
        skin_condition VARCHAR(50) COMMENT '皮肤状况',
        pain_level TINYINT COMMENT '疼痛程度(0-10)',
        odor_level TINYINT COMMENT '气味程度(0-10)',
        leak_incident TINYINT DEFAULT 0 COMMENT '是否有渗漏',
        bag_change_count TINYINT DEFAULT 0 COMMENT '更换造口袋次数',
        diet_notes TEXT COMMENT '饮食记录',
        mood VARCHAR(50) COMMENT '心情状态',
        notes TEXT COMMENT '其他备注',
        images JSON COMMENT '图片URLs数组',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_patient_id (patient_id),
        INDEX idx_diary_date (diary_date),
        UNIQUE KEY uk_patient_date (patient_id, diary_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='症状日记表';
    `);
    
    // 创建课程分类表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS course_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL COMMENT '分类名称',
        icon VARCHAR(100) COMMENT '图标',
        description TEXT COMMENT '描述',
        sort_order INT DEFAULT 0 COMMENT '排序',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程分类表';
    `);
    
    // 创建课程表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NOT NULL COMMENT '分类ID',
        title VARCHAR(100) NOT NULL COMMENT '课程标题',
        cover_image VARCHAR(255) COMMENT '封面图片',
        description TEXT COMMENT '课程描述',
        content LONGTEXT COMMENT '课程内容',
        video_url VARCHAR(255) COMMENT '视频URL',
        duration INT COMMENT '时长(秒)',
        difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner' COMMENT '难度',
        view_count INT DEFAULT 0 COMMENT '浏览次数',
        like_count INT DEFAULT 0 COMMENT '点赞数',
        sort_order INT DEFAULT 0 COMMENT '排序',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE CASCADE,
        INDEX idx_category_id (category_id),
        INDEX idx_sort_order (sort_order),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';
    `);
    
    // 创建学习记录表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL COMMENT '患者ID',
        course_id INT NOT NULL COMMENT '课程ID',
        progress INT DEFAULT 0 COMMENT '学习进度(0-100)',
        completed TINYINT DEFAULT 0 COMMENT '是否完成',
        last_position INT DEFAULT 0 COMMENT '最后观看位置(秒)',
        study_duration INT DEFAULT 0 COMMENT '累计学习时长(秒)',
        last_study_at DATETIME COMMENT '最后学习时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY uk_patient_course (patient_id, course_id),
        INDEX idx_patient_id (patient_id),
        INDEX idx_course_id (course_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习记录表';
    `);
    
    // 创建护理计划表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS care_plans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL COMMENT '患者ID',
        nurse_id INT COMMENT '制定护士ID',
        title VARCHAR(100) NOT NULL COMMENT '计划标题',
        description TEXT COMMENT '计划描述',
        start_date DATE NOT NULL COMMENT '开始日期',
        end_date DATE COMMENT '结束日期',
        frequency VARCHAR(50) COMMENT '频率',
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active' COMMENT '状态',
        notes TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_patient_id (patient_id),
        INDEX idx_status (status),
        INDEX idx_start_date (start_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='护理计划表';
    `);
    
    // 创建护理计划项目表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS care_plan_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        plan_id INT NOT NULL COMMENT '护理计划ID',
        title VARCHAR(100) NOT NULL COMMENT '项目标题',
        description TEXT COMMENT '项目描述',
        target_value VARCHAR(50) COMMENT '目标值',
        completed TINYINT DEFAULT 0 COMMENT '是否完成',
        completed_at DATETIME COMMENT '完成时间',
        sort_order INT DEFAULT 0 COMMENT '排序',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES care_plans(id) ON DELETE CASCADE,
        INDEX idx_plan_id (plan_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='护理计划项目表';
    `);
    
    // 创建提醒表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL COMMENT '患者ID',
        title VARCHAR(100) NOT NULL COMMENT '提醒标题',
        description TEXT COMMENT '提醒描述',
        reminder_type ENUM('medication', 'bag_change', 'checkup', 'exercise', 'diet', 'custom') NOT NULL COMMENT '提醒类型',
        remind_time TIME NOT NULL COMMENT '提醒时间',
        frequency ENUM('once', 'daily', 'weekly', 'monthly', 'custom') DEFAULT 'daily' COMMENT '频率',
        remind_days VARCHAR(50) COMMENT '提醒日期(JSON格式)',
        enabled TINYINT DEFAULT 1 COMMENT '是否启用',
        notes TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_patient_id (patient_id),
        INDEX idx_enabled (enabled)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提醒表';
    `);
    
    // 创建提醒记录表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reminder_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reminder_id INT NOT NULL COMMENT '提醒ID',
        remind_date DATE NOT NULL COMMENT '提醒日期',
        remind_time TIME NOT NULL COMMENT '提醒时间',
        completed TINYINT DEFAULT 0 COMMENT '是否完成',
        completed_at DATETIME COMMENT '完成时间',
        notes TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE,
        INDEX idx_reminder_id (reminder_id),
        INDEX idx_remind_date (remind_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提醒记录表';
    `);
    
    // 创建家属表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL COMMENT '患者ID',
        name VARCHAR(50) NOT NULL COMMENT '姓名',
        relationship VARCHAR(50) NOT NULL COMMENT '关系',
        phone VARCHAR(20) COMMENT '联系电话',
        is_primary TINYINT DEFAULT 0 COMMENT '是否主要联系人',
        notes TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_patient_id (patient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家属表';
    `);
    
    console.log('✅ 所有数据表创建成功\n');
    
    // 插入初始数据
    console.log('📝 插入初始数据...');
    
    // 插入课程分类
    await connection.query(`
      INSERT INTO course_categories (name, icon, description, sort_order) VALUES
      ('基础护理', 'icon-basic', '造口基础护理知识', 1),
      ('实操技巧', 'icon-practice', '护理操作实用技巧', 2),
      ('饮食指导', 'icon-diet', '造口患者饮食建议', 3),
      ('应急处理', 'icon-emergency', '常见问题应急处理', 4),
      ('心理康复', 'icon-psychology', '心理调适与康复', 5)
      ON DUPLICATE KEY UPDATE name=name;
    `);
    
    // 插入示例课程
    await connection.query(`
      INSERT INTO courses (category_id, title, cover_image, description, content, difficulty, sort_order) VALUES
      (1, '认识造口', '/images/course1.jpg', '了解什么是造口，造口的类型和基本知识', 
       '<h2>什么是造口</h2><p>造口是通过手术在腹壁建立的人工开口...</p>', 'beginner', 1),
      (1, '造口用品认知', '/images/course2.jpg', '认识各种造口护理用品及其使用方法',
       '<h2>造口袋的种类</h2><p>造口袋主要分为一件式和两件式...</p>', 'beginner', 2),
      (2, '造口袋更换步骤', '/images/course3.jpg', '详细讲解如何正确更换造口袋',
       '<h2>更换造口袋的步骤</h2><ol><li>准备用物</li><li>揭除旧造口袋...</li></ol>', 'intermediate', 1),
      (3, '造口患者饮食原则', '/images/course4.jpg', '了解造口患者的饮食注意事项',
       '<h2>饮食原则</h2><p>少食多餐，循序渐进...</p>', 'beginner', 1),
      (4, '处理造口周围皮肤问题', '/images/course5.jpg', '学习如何预防和处理皮肤并发症',
       '<h2>常见皮肤问题</h2><p>皮肤潮红、溃破...</p>', 'advanced', 1)
      ON DUPLICATE KEY UPDATE title=title;
    `);
    
    console.log('✅ 初始数据插入成功\n');
    
    console.log('🎉 数据库初始化完成！\n');
    console.log('数据库名称:', dbName);
    console.log('总共创建了 15 张数据表');
    console.log('插入了初始课程分类和示例课程\n');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
