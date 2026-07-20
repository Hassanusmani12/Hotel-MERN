const express = require('express');
const router = express.Router();
const { 
    getAllBookings, 
    getUserBookings, 
    createBooking, 
    cancelBooking 
} = require('../controllers/bookingController');

// --- Admin Route ---
router.get('/', getAllBookings); 

// --- User Routes ---
router.post('/', createBooking);            
router.get('/:userId', getUserBookings);    
router.delete('/:id', cancelBooking);       

module.exports = router;