const pool = require('../config/db');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadProgressNote = async (req, res) => {
    const { studentID } = req.body;
    const file = req.file;
    if (!file || !studentID) {
        return res.status(400).json({ error: "Missing file or studentID" });
    }
    try {
        // Upload to Cloudinary as a raw file (for PDFs)
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "raw"
        });

        // Save Cloudinary URL and correct file size to DB
        await pool.query(
            "INSERT INTO progressnotes (studentID, file_path, file_name, mime_type, file_size) VALUES (?, ?, ?, ?, ?)",
            [studentID, result.secure_url, file.originalname, file.mimetype, result.bytes]
        );
        res.status(201).json({ message: "File uploaded and saved", url: result.secure_url });
    } catch (err) {
        res.status(500).json({ error: "Failed to save file info" });
    }
};

exports.getNotesByStudentID = async (req, res) => {
    const { studentID } = req.params;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM progressnotes WHERE studentID = ? ORDER BY uploaded_at DESC",
            [studentID]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
};