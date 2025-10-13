const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
    const { studentID } = req.body;
    const file = req.file;
    if (!file || !studentID) return res.status(400).json({ error: "Missing file or studentID" });

    const destination = `progressnotes/${studentID}/${file.originalname}`;
    const bucket = admin.storage().bucket();

    try {
        const blob = bucket.file(destination);
        const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype }
        });

        blobStream.end(file.buffer);

        blobStream.on('finish', async () => {
            // Get public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
            // Save publicUrl in your DB if needed
            res.json({ url: publicUrl });
        });

        blobStream.on('error', (err) => {
            res.status(500).json({ error: "Upload failed" });
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;