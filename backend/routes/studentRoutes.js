const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.getAllStudents);
router.get('/by-user/:userID', studentController.getStudentByUserID);
router.get('/statuses', studentController.getAllStatuses);
router.put('/by-user/:userID', studentController.saveStudentProfile);

module.exports = router;