const express = require('express');
const router = express.Router();
const lessonReportController = require('../controllers/lessonReportController');

router.post('/', lessonReportController.createLessonReport);

module.exports = router;