const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room', // Must match your Room model name exactly
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Must match your User model name exactly
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: 'Confirmed',
        enum: ['Confirmed', 'Cancelled', 'Completed']
    },
    paymentMethod: {
        type: String,
        default: 'card'
    },
    paymentStatus: {
        type: String,
        default: 'paid'
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);