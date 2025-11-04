const express = require('express');
const router = express.Router();
const CarePlanController = require('../controllers/carePlanController');
const { verifyToken } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(verifyToken);

// 创建护理计划
router.post('/', CarePlanController.create);

// 获取护理计划列表
router.get('/', CarePlanController.getList);

// 获取护理计划详情
router.get('/:id', CarePlanController.getById);

// 更新护理计划
router.put('/:id', CarePlanController.update);

// 删除护理计划
router.delete('/:id', CarePlanController.delete);

// 添加计划项目
router.post('/:id/items', CarePlanController.addItem);

// 更新项目状态
router.put('/:id/items/:itemId', CarePlanController.updateItemStatus);

module.exports = router;




