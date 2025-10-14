// Get inbox messages for a user
exports.getInbox = async (req, res) => {
    const pool = require('../config/db');
    const { userID } = req.params;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM Messages WHERE receiverID = ? ORDER BY sentAt DESC",
            [userID]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch inbox messages" });
    }
};

// Get sent messages for a user
exports.getSent = async (req, res) => {
    const pool = require('../config/db');
    const { userID } = req.params;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM Messages WHERE senderID = ? ORDER BY sentAt DESC",
            [userID]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sent messages" });
    }
};

// Send a new message
exports.sendMessage = async (req, res) => {
    const pool = require('../config/db');
    const { senderID, receiverID, subject, body } = req.body;
    try {
        await pool.query(
            "INSERT INTO Messages (senderID, receiverID, subject, body) VALUES (?, ?, ?, ?)",
            [senderID, receiverID, subject, body]
        );
        res.status(201).json({ message: "Message sent!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send message" });
    }
};

// Mark a message as read
exports.markAsRead = async (req, res) => {
    const pool = require('../config/db');
    const { messageID } = req.params;
    try {
        await pool.query(
            "UPDATE Messages SET isRead = TRUE WHERE messageID = ?",
            [messageID]
        );
        res.json({ message: "Message marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark message as read" });
    }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
    const pool = require('../config/db');
    const { messageID } = req.params;
    try {
        await pool.query(
            "DELETE FROM Messages WHERE messageID = ?",
            [messageID]
        );
        res.json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete message" });
    }
};