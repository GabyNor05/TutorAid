const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

// Get all tutors
router.get('/', tutorController.getAllTutors);

// Get single tutor by ID
router.get('/:id', tutorController.getTutorById);

// Create a new tutor
router.post('/', tutorController.createTutor);

// Update tutor
router.put('/:id', tutorController.updateTutor);

// Delete tutor
router.delete('/:id', tutorController.deleteTutor);

// Get tutor by user ID
router.get('/by-user/:userID', tutorController.getTutorByUserID);

// Save tutor profile by user ID
router.put('/by-user/:userID', tutorController.saveTutorProfile);

// ADD these routes
router.get('/by-subject/:subject', tutorController.getTutorsBySubject);
router.get('/:tutorID/availability', tutorController.getTutorAvailability);

module.exports = router;