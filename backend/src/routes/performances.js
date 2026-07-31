const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

// GET /api/performances — 演出列表（支持多条件筛选）
router.get('/', performanceController.list);

// GET /api/performances/:id — 演出详情
router.get('/:id', performanceController.detail);

// POST /api/performances — 新增演出
router.post('/', performanceController.create);

// PUT /api/performances/:id — 更新演出
router.put('/:id', performanceController.update);

// DELETE /api/performances/:id — 删除演出
router.delete('/:id', performanceController.remove);

module.exports = router;
