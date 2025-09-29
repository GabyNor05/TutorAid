const express = require('express');
const router = express.Router();
const multer = require('multer');
const progressNotesController = require('../controllers/progressNotesController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/progressnotes/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), progressNotesController.uploadProgressNote);
router.get('/student/:studentID', progressNotesController.getNotesByStudentID);

module.exports = router;