const express = require('express');
const router = express.Router();
const { sendMessage, clearHistory } = require('../controllers/chatController');

// POST /api/chat/message - Send message to AI concierge
router.post('/message', sendMessage);

// POST /api/chat/clear - Clear conversation history
router.post('/clear', clearHistory);

module.exports = router;
