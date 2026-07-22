const express = require('express');
const router = express.Router();
const { 
    getAllBookings, 
    getUserBookings, 
    createBooking, 
    cancelBooking,
    deleteBooking 
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Admin Routes ---
router.get('/', getAllBookings); 
router.delete('/:id', protect, admin, deleteBooking);     // Admin hard-delete

// --- User Routes ---
router.post('/', createBooking);            
router.get('/:userId', getUserBookings);    
router.put('/:id/cancel', cancelBooking);   // User soft-cancel (24h window)

module.exports = router;