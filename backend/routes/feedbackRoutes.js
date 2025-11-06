const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/feedbackController');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;