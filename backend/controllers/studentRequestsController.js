const pool = require('../config/db');

exports.createStudentRequest = async (req, res) => {
    const {
        studentID,
        requestType,
        lessonDate,
        subjectID,
        newSubjectName,
        newSubjectDescription,
        query
    } = req.body;

    if (!studentID) {
        return res.status(400).json({ error: "studentID is required" });
    }

    try {
        const requestData = { studentID, requestType, lessonDate, subjectID, newSubjectName, newSubjectDescription, query };
        console.log("Submitting request:", requestData);

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