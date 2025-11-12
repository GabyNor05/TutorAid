const express = require('express');
const router = express.Router();
const controller = require('../controllers/newSubjectRequestsController');

router.post('/', controller.create); // POST /api/newSubjectRequests

module.exports = router;