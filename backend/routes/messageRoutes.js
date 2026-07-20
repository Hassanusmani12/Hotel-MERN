const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, deleteMessage } = require('../controllers/messageController');

router.route('/').post(sendMessage).get(getMessages);
router.delete('/:id', deleteMessage);

module.exports = router;