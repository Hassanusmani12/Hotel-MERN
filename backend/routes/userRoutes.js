const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    updateUserProfile, 
    changePassword 
} = require('../controllers/userController');

// Middleware import
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword); // ✅ Yeh route hona zaroori hai

module.exports = router;