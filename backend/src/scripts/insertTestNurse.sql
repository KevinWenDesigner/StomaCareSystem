-- 插入测试护士账号
-- 用于测试登录功能

-- 如果表中没有数据，插入测试护士
INSERT INTO nurses (name, email, phone, work_number, department, position, status, created_at, updated_at)
SELECT 'test', 'test@nurse.com', '13800138000', 'N001', '造口护理科', '护士', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM nurses WHERE email = 'test@nurse.com');

-- 可选：插入更多测试护士
INSERT INTO nurses (name, email, phone, work_number, department, position, status, created_at, updated_at)
SELECT '张护士', 'zhang@nurse.com', '13800138001', 'N002', '造口护理科', '护士长', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM nurses WHERE email = 'zhang@nurse.com');

INSERT INTO nurses (name, email, phone, work_number, department, position, status, created_at, updated_at)
SELECT '李护士', 'li@nurse.com', '13800138002', 'N003', '造口护理科', '护士', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM nurses WHERE email = 'li@nurse.com');

-- 查看插入结果
SELECT id, name, email, phone, work_number, department, position, status FROM nurses;

