const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.getAllStudents);
router.get('/by-user/:userID', studentController.getStudentByUserID);
router.get('/statuses', studentController.getAllStatuses);

module.exports = router;