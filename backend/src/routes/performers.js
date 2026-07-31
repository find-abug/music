const express = require('express');
const router = express.Router();
const performerController = require('../controllers/performerController');

router.get('/', performerController.list);
router.get('/:id', performerController.detail);
router.post('/', performerController.create);
router.put('/:id', performerController.update);
router.delete('/:id', performerController.remove);

module.exports = router;
