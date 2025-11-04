const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/assessmentController');
const { verifyToken, checkUserType } = require('../middlewares/auth');
const upload = require('../config/upload');

// 所有路由都需要认证
router.use(verifyToken);

// 创建评估（上传图片）
router.post('/', upload.single('image'), AssessmentController.create);

// 获取评估列表
router.get('/', AssessmentController.getList);

// 获取最新评估
router.get('/latest', AssessmentController.getLatest);

// 获取患者评估历史
router.get('/history/:patientId', AssessmentController.getHistory);

// 获取评估详情
router.get('/:id', AssessmentController.getById);

// 护士审阅评估
router.post('/:id/review', checkUserType('nurse', 'admin'), AssessmentController.nurseReview);

// 删除评估
router.delete('/:id', AssessmentController.delete);

module.exports = router;




