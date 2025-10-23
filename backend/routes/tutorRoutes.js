const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

// Specific routes FIRST
router.get('/', tutorController.getAllTutors);
router.get('/by-subject/:subject', tutorController.getTutorsBySubject);
router.get('/by-user/:userID', tutorController.getTutorByUserID);
router.put('/by-user/:userID', tutorController.updateTutorByUserID);
router.get('/:tutorID/availability', tutorController.getTutorAvailability);

// Generic ID routes AFTER specifics
router.get('/:id', tutorController.getTutorById);
router.post('/', tutorController.createTutor);
router.put('/:id', tutorController.updateTutor);
router.delete('/:id', tutorController.deleteTutor);

module.exports = router;