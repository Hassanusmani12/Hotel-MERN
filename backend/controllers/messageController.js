const Message = require('../models/Message');

const sendMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        await Message.create({ name, email, subject, message });
        res.status(201).json({ message: "Message Sent Successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: "Message Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getMessages, deleteMessage };