const express = require('express');
const router = express.Router();
const conductorController = require('../controllers/conductorController');

router.get('/', conductorController.list);
router.get('/:id', conductorController.detail);
router.post('/', conductorController.create);
router.put('/:id', conductorController.update);
router.delete('/:id', conductorController.remove);

module.exports = router;
