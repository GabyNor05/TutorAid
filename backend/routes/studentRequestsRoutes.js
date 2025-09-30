const express = require('express');
const router = express.Router();
const studentRequestsController = require('../controllers/studentRequestsController');

router.post('/', studentRequestsController.createStudentRequest);

module.exports = router;