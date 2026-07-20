const express = require('express');
const router = express.Router();

// ✅ Import Controller Functions
const { 
    getRooms, 
    getRoom,      // Function for single room detail
    createRoom, 
    deleteRoom, 
    updateRoom 
} = require('../controllers/roomController');

// 1. Base Route (Get All & Create)
router.route('/')
    .get(getRooms)
    .post(createRoom);

// 2. ID-Specific Route (Get One, Update, Delete)
router.route('/:id')
    .get(getRoom)       // ✅ Essential for Room Details Page
    .delete(deleteRoom)
    .put(updateRoom);

module.exports = router;