const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController');
const { verifyToken } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(verifyToken);

// 获取课程分类
router.get('/categories', CourseController.getCategories);

// 获取我的学习记录
router.get('/my-learning', CourseController.getMyLearning);

// 获取课程列表
router.get('/', CourseController.getList);

// 获取课程详情
router.get('/:id', CourseController.getById);

// 获取课程章节列表
router.get('/:id/chapters', CourseController.getChapters);

// 获取单个章节详情
router.get('/:id/chapters/:chapterId', CourseController.getChapterById);

// 记录学习进度
router.post('/:id/progress', CourseController.recordProgress);

// 点赞课程
router.post('/:id/like', CourseController.likeCourse);

module.exports = router;




