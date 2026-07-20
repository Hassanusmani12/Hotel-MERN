const Amenity = require('../models/Amenity');

const getAmenities = async (req, res) => {
    try {
        const amenities = await Amenity.find({}).sort({ name: 1 });
        res.json(amenities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAmenity = async (req, res) => {
    try {
        const { name, icon, category } = req.body;
        const existing = await Amenity.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ message: 'Amenity already exists' });
        }
        const amenity = await Amenity.create({ name, icon, category });
        res.status(201).json(amenity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAmenity = async (req, res) => {
    try {
        const amenity = await Amenity.findById(req.params.id);
        if (amenity) {
            await amenity.deleteOne();
            res.json({ message: 'Amenity deleted' });
        } else {
            res.status(404).json({ message: 'Amenity not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAmenities, createAmenity, deleteAmenity };
