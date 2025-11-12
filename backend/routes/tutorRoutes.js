const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

router.get('/', tutorController.getAllTutors);
router.get('/by-subject/:subject', tutorController.getTutorsBySubject);
router.get('/by-user/:userID', tutorController.getTutorByUserID);
router.put('/by-user/:userID', tutorController.updateTutorByUserID);
router.get('/:id/availability', tutorController.getTutorAvailability);
router.get('/:id', tutorController.getById);

module.exports = router;