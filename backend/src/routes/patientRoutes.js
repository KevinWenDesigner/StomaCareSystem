const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientController');
const { verifyToken, checkUserType } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(verifyToken);

// 创建患者信息（患者自己）
router.post('/', checkUserType('patient'), PatientController.create);

// 获取我的患者信息
router.get('/me', checkUserType('patient'), PatientController.getMyInfo);

// 获取患者列表（护士、管理员）
router.get('/', checkUserType('nurse', 'admin'), PatientController.getList);

// 获取患者详情
router.get('/:id', PatientController.getById);

// 更新患者信息
router.put('/:id', PatientController.update);

// 删除患者
router.delete('/:id', checkUserType('admin'), PatientController.delete);

module.exports = router;




