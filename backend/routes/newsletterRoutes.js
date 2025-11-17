const express = require('express');
const router = express.Router();
const c = require('../controllers/newsletterController');

router.get('/subscribers', c.listSubscribers);
router.post('/subscribe', c.subscribe);
router.post('/unsubscribe', c.unsubscribe);
router.get('/templates', c.listTemplates);
router.post('/templates', c.createTemplate);
router.put('/templates/:id', c.updateTemplate);
router.delete('/templates/:id', c.deleteTemplate);
router.post('/send', c.sendNewsletter);

module.exports = router;