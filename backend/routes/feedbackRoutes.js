const express = require('express');
const router = express.Router();
const controller = require('../controllers/feedbackController');

router.get('/', controller.list);
router.put('/:id/status', controller.updateStatus);   // supports PUT
router.patch('/:id/status', controller.updateStatus); // and PATCH

module.exports = router;