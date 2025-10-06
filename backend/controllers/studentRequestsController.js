const pool = require('../config/db');

exports.createStudentRequest = async (req, res) => {
    const {
        studentID,
        requestType,
        lessonDate = null,
        subjectID = null,
        newSubjectName = null,
        newSubjectDescription = null,
        query = null
    } = req.body;

    if (!studentID) {
        return res.status(400).json({ error: "studentID is required" });
    }
    if (!requestType) {
        return res.status(400).json({ error: "requestType is required" });
    }
    // For Appeal_Block, query is required
    if (requestType === "Appeal_Block" && !query) {
        return res.status(400).json({ error: "query is required for Appeal_Block" });
    }

    try {
        await pool.query(
            `INSERT INTO StudentRequests 
            (studentID, requestType, lessonDate, subjectID, newSubjectName, newSubjectDescription, query) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [studentID, requestType, lessonDate, subjectID, newSubjectName, newSubjectDescription, query]
        );
        res.status(201).json({ message: "Request submitted" });
    } catch (err) {
        console.error("Error in createStudentRequest:", err);
        res.status(500).json({ error: "Failed to submit request" });
    }
};

exports.getAllStudentRequests = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM StudentRequests ORDER BY createdAt DESC');
        console.log("Fetched requests from DB:", rows); // Should log array of objects
        res.json(rows);
    } catch (err) {
        console.error("Error fetching student requests:", err);
        res.status(500).json({ error: "Failed to fetch student requests" });
    }
};