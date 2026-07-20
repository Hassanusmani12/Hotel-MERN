const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    
    // ✅ Amenities stored as a list
    amenities: { 
        type: [String], 
        default: [] 
    }, 

    images: { 
        type: [String], 
        default: [] 
    },
    image: { 
        type: String 
    }, 
    
    capacity: {
        type: Number,
        required: true,
        default: 2
    },
    
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
        default: 'Available'
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);