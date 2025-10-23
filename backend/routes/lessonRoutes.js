const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

router.get('/', lessonController.getLessonsForTutor);
router.post('/', lessonController.createLesson);
router.post('/update-status', lessonController.updateLessonStatus);
router.post('/delete', lessonController.deleteLesson);
router.get('/accepted', lessonController.getAcceptedLessons);

module.exports = router;