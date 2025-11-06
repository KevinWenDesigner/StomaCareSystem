const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

// 通用登录接口（用于测试和Web端）
router.post('/login', AuthController.login);

// 患者登录
router.post('/login/patient', AuthController.patientLogin);

// 护士登录
router.post('/login/nurse', AuthController.nurseLogin);

// 获取当前用户信息（需要认证）
router.get('/me', verifyToken, AuthController.getCurrentUser);

// 刷新token（需要认证）
router.post('/refresh', verifyToken, AuthController.refreshToken);

module.exports = router;




