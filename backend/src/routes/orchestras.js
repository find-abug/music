const express = require('express');
const router = express.Router();
const orchestraController = require('../controllers/orchestraController');

router.get('/', orchestraController.list);
router.get('/:id', orchestraController.detail);
router.post('/', orchestraController.create);
router.put('/:id', orchestraController.update);
router.delete('/:id', orchestraController.remove);

module.exports = router;
