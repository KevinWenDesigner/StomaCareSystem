const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/familyController');
const { verifyToken } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(verifyToken);

// 创建家属
router.post('/', FamilyController.create);

// 获取家属列表
router.get('/', FamilyController.getList);

// 更新家属信息
router.put('/:id', FamilyController.update);

// 设置主要联系人
router.put('/:id/primary', FamilyController.setPrimary);

// 删除家属
router.delete('/:id', FamilyController.delete);

module.exports = router;




