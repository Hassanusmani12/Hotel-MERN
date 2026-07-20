const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    googleId: {
        type: String,
        sparse: true,
        default: null
    },
    // ✅ FIX: Phone ko required: false kar diya (Optional)
    phone: {
        type: String,
        required: false, 
        default: ""
    },
    role: {
        type: String,
        enum: ['guest', 'admin'],
        default: 'guest'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);