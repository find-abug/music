const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

router.get('/', venueController.list);
router.get('/:id', venueController.detail);
router.post('/', venueController.create);
router.put('/:id', venueController.update);
router.delete('/:id', venueController.remove);

module.exports = router;
