const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const studentID = req.body.studentID;
    const fileBuffer = req.file.buffer;

    // Upload to Cloudinary using upload_stream
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: `progressnotes/${studentID}`,
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ url: result.secure_url });
      }
    );
    stream.end(fileBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;