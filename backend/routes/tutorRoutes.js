const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

router.get('/', tutorController.getAllTutors);
router.get('/by-subject/:subject', tutorController.getTutorsBySubject);
router.get('/:id/availability', tutorController.getTutorAvailability);
router.get('/:id', tutorController.getById);

module.exports = router;