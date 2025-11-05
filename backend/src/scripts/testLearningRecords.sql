-- 测试学习记录SQL脚本
-- 用于快速查看和插入学习记录数据

-- 1. 查看所有患者
SELECT id, name, phone, stoma_type FROM patients;

-- 2. 查看所有课程
SELECT id, title, difficulty, category_id FROM courses;

-- 3. 查看所有学习记录
SELECT 
  lr.id,
  p.name as patient_name,
  c.title as course_title,
  lr.progress,
  lr.completed,
  lr.study_duration,
  lr.last_study_at
FROM learning_records lr
LEFT JOIN patients p ON lr.patient_id = p.id
LEFT JOIN courses c ON lr.course_id = c.id
ORDER BY lr.last_study_at DESC;

-- 4. 查看特定患者的学习记录（请替换 YOUR_PATIENT_ID）
SELECT 
  lr.id,
  c.title as course_title,
  c.difficulty,
  lr.progress,
  lr.completed,
  CONCAT(FLOOR(lr.study_duration / 60), '分', lr.study_duration % 60, '秒') as duration,
  lr.last_study_at
FROM learning_records lr
LEFT JOIN courses c ON lr.course_id = c.id
WHERE lr.patient_id = 1  -- 修改为实际的患者ID
ORDER BY lr.last_study_at DESC;

-- 5. 查看学习统计
SELECT 
  p.name as patient_name,
  COUNT(*) as total_courses,
  SUM(lr.completed) as completed_courses,
  CONCAT(FLOOR(SUM(lr.study_duration) / 60), '分钟') as total_study_time,
  ROUND(AVG(lr.progress), 2) as avg_progress
FROM learning_records lr
LEFT JOIN patients p ON lr.patient_id = p.id
GROUP BY lr.patient_id, p.name;

-- 6. 插入测试学习记录（手动执行）
-- 注意：需要先确认 patient_id 和 course_id 存在

/*
-- 示例：为患者ID=1插入学习记录
INSERT INTO learning_records 
(patient_id, course_id, progress, completed, last_position, study_duration, last_study_at)
VALUES
-- 课程1：已完成（100%）
(1, 1, 100, 1, 0, 1800, DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- 课程2：进行中（75%）
(1, 2, 75, 0, 0, 1350, DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- 课程3：进行中（50%）
(1, 3, 50, 0, 0, 900, NOW()),
-- 课程4：刚开始（25%）
(1, 4, 25, 0, 0, 450, DATE_SUB(NOW(), INTERVAL 3 HOUR));
*/

-- 7. 更新学习进度（模拟前端调用）
/*
UPDATE learning_records 
SET 
  progress = 80,
  study_duration = study_duration + 300,
  last_study_at = NOW()
WHERE patient_id = 1 AND course_id = 2;
*/

-- 8. 删除所有学习记录（慎用！）
-- DELETE FROM learning_records WHERE patient_id = 1;

-- 9. 查看最近7天的学习活动
SELECT 
  DATE(lr.last_study_at) as study_date,
  COUNT(*) as study_sessions,
  SUM(lr.study_duration) as total_duration,
  COUNT(DISTINCT lr.course_id) as courses_studied
FROM learning_records lr
WHERE lr.last_study_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(lr.last_study_at)
ORDER BY study_date DESC;

-- 10. 查看进度完成情况分布
SELECT 
  CASE 
    WHEN progress = 100 THEN '已完成'
    WHEN progress >= 75 THEN '75-99%'
    WHEN progress >= 50 THEN '50-74%'
    WHEN progress >= 25 THEN '25-49%'
    ELSE '0-24%'
  END as progress_range,
  COUNT(*) as count
FROM learning_records
GROUP BY progress_range
ORDER BY 
  CASE 
    WHEN progress = 100 THEN 1
    WHEN progress >= 75 THEN 2
    WHEN progress >= 50 THEN 3
    WHEN progress >= 25 THEN 4
    ELSE 5
  END;


-- 用于快速查看和插入学习记录数据

-- 1. 查看所有患者
SELECT id, name, phone, stoma_type FROM patients;

-- 2. 查看所有课程
SELECT id, title, difficulty, category_id FROM courses;

-- 3. 查看所有学习记录
SELECT 
  lr.id,
  p.name as patient_name,
  c.title as course_title,
  lr.progress,
  lr.completed,
  lr.study_duration,
  lr.last_study_at
FROM learning_records lr
LEFT JOIN patients p ON lr.patient_id = p.id
LEFT JOIN courses c ON lr.course_id = c.id
ORDER BY lr.last_study_at DESC;

-- 4. 查看特定患者的学习记录（请替换 YOUR_PATIENT_ID）
SELECT 
  lr.id,
  c.title as course_title,
  c.difficulty,
  lr.progress,
  lr.completed,
  CONCAT(FLOOR(lr.study_duration / 60), '分', lr.study_duration % 60, '秒') as duration,
  lr.last_study_at
FROM learning_records lr
LEFT JOIN courses c ON lr.course_id = c.id
WHERE lr.patient_id = 1  -- 修改为实际的患者ID
ORDER BY lr.last_study_at DESC;

-- 5. 查看学习统计
SELECT 
  p.name as patient_name,
  COUNT(*) as total_courses,
  SUM(lr.completed) as completed_courses,
  CONCAT(FLOOR(SUM(lr.study_duration) / 60), '分钟') as total_study_time,
  ROUND(AVG(lr.progress), 2) as avg_progress
FROM learning_records lr
LEFT JOIN patients p ON lr.patient_id = p.id
GROUP BY lr.patient_id, p.name;

-- 6. 插入测试学习记录（手动执行）
-- 注意：需要先确认 patient_id 和 course_id 存在

/*
-- 示例：为患者ID=1插入学习记录
INSERT INTO learning_records 
(patient_id, course_id, progress, completed, last_position, study_duration, last_study_at)
VALUES
-- 课程1：已完成（100%）
(1, 1, 100, 1, 0, 1800, DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- 课程2：进行中（75%）
(1, 2, 75, 0, 0, 1350, DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- 课程3：进行中（50%）
(1, 3, 50, 0, 0, 900, NOW()),
-- 课程4：刚开始（25%）
(1, 4, 25, 0, 0, 450, DATE_SUB(NOW(), INTERVAL 3 HOUR));
*/

-- 7. 更新学习进度（模拟前端调用）
/*
UPDATE learning_records 
SET 
  progress = 80,
  study_duration = study_duration + 300,
  last_study_at = NOW()
WHERE patient_id = 1 AND course_id = 2;
*/

-- 8. 删除所有学习记录（慎用！）
-- DELETE FROM learning_records WHERE patient_id = 1;

-- 9. 查看最近7天的学习活动
SELECT 
  DATE(lr.last_study_at) as study_date,
  COUNT(*) as study_sessions,
  SUM(lr.study_duration) as total_duration,
  COUNT(DISTINCT lr.course_id) as courses_studied
FROM learning_records lr
WHERE lr.last_study_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(lr.last_study_at)
ORDER BY study_date DESC;

-- 10. 查看进度完成情况分布
SELECT 
  CASE 
    WHEN progress = 100 THEN '已完成'
    WHEN progress >= 75 THEN '75-99%'
    WHEN progress >= 50 THEN '50-74%'
    WHEN progress >= 25 THEN '25-49%'
    ELSE '0-24%'
  END as progress_range,
  COUNT(*) as count
FROM learning_records
GROUP BY progress_range
ORDER BY 
  CASE 
    WHEN progress = 100 THEN 1
    WHEN progress >= 75 THEN 2
    WHEN progress >= 50 THEN 3
    WHEN progress >= 25 THEN 4
    ELSE 5
  END;

