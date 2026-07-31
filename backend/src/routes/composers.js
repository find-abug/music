const express = require('express');
const router = express.Router();
const composerController = require('../controllers/composerController');

// GET /api/composers — 作曲家列表
router.get('/', composerController.list);

// GET /api/composers/:id — 作曲家详情
router.get('/:id', composerController.detail);

// POST /api/composers — 新增作曲家
router.post('/', composerController.create);

// PUT /api/composers/:id — 更新作曲家
router.put('/:id', composerController.update);

// DELETE /api/composers/:id — 删除作曲家
router.delete('/:id', composerController.remove);

module.exports = router;
