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

module.exports = router;