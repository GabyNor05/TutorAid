const express = require('express');
const router = express.Router();
const ctl = require('../controllers/newsletterController');

// Public
router.post('/subscribe', ctl.subscribe);

// Admin (consider protecting these with auth middleware)
// Subscribers
router.get('/subscribers', ctl.listSubscribers);
router.delete('/subscribers/:id', ctl.deleteSubscriber);
router.post('/unsubscribe', ctl.unsubscribeByEmail);

// Templates
router.get('/templates', ctl.listTemplates);
router.post('/templates', ctl.createTemplate);
router.put('/templates/:id', ctl.updateTemplate);
router.delete('/templates/:id', ctl.deleteTemplate);

// Send
router.post('/send', ctl.send);

module.exports = router;