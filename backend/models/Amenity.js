const mongoose = require('mongoose');

const AmenitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    icon: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'General'
    }
}, { timestamps: true });

module.exports = mongoose.model('Amenity', AmenitySchema);
