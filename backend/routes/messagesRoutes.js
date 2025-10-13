const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

router.get('/inbox/:userID', messagesController.getInbox);
router.get('/sent/:userID', messagesController.getSent);
router.post('/', messagesController.sendMessage);
router.patch('/:messageID/read', messagesController.markAsRead);
router.delete('/:messageID', messagesController.deleteMessage);

module.exports = router;