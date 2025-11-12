const express = require('express');
const router = express.Router();
const controller = require('../controllers/progressNotesController');

// List notes by student
router.get('/student/:studentID', controller.getByStudent);

// Publish via body { noteID }
router.post('/publish', controller.publishByBody);

// Publish via URL param
router.patch('/:id/publish', controller.publishById);

module.exports = router;