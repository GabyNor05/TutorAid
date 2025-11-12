const express = require('express');
const router = express.Router();
const controller = require('../controllers/feedbackController');

router.get('/', controller.list);
router.post('/', controller.create);              // ADD
router.put('/:id/status', controller.updateStatus);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;