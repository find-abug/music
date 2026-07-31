const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET /api/admin/performances/pending — 待审核列表
router.get('/performances/pending', adminController.pendingList);

// PUT /api/admin/performances/:id/verify — 审核通过
router.put('/performances/:id/verify', adminController.verify);

// PUT /api/admin/performances/:id/reject — 驳回
router.put('/performances/:id/reject', adminController.reject);

// GET /api/admin/stats — 数据统计
router.get('/stats', adminController.stats);

module.exports = router;
