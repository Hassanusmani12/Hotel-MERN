const Room = require('../models/Room');

// @desc    Get All Rooms
// @route   GET /api/rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Single Room by ID
// @route   GET /api/rooms/:id
const getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (room) {
            res.json(room);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a Room
// @route   POST /api/rooms
const createRoom = async (req, res) => {
    try {
        const { roomNumber, type, price, description, images, image, status, amenities, capacity } = req.body;

        const roomExists = await Room.findOne({ roomNumber });
        if (roomExists) {
            return res.status(400).json({ message: 'Room already exists' });
        }

        // Handle Images
        let finalImages = images || [];
        if (finalImages.length === 0 && image) {
            finalImages.push(image);
        }

        // Handle Amenities (String to Array)
        let amenitiesArray = [];
        if (typeof amenities === 'string') {
            amenitiesArray = amenities.split(',').map(item => item.trim());
        } else if (Array.isArray(amenities)) {
            amenitiesArray = amenities;
        }

        const room = await Room.create({
            roomNumber,
            type,
            price,
            description,
            images: finalImages,
            image: image || (finalImages.length > 0 ? finalImages[0] : ""), 
            status: status || 'Available',
            amenities: amenitiesArray,
            capacity: capacity || 2
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a Room
// @route   PUT /api/rooms/:id
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            room.roomNumber = req.body.roomNumber || room.roomNumber;
            room.type = req.body.type || room.type;
            room.price = req.body.price || room.price;
            room.description = req.body.description || room.description;
            
            if (req.body.images) room.images = req.body.images;
            if (req.body.image) room.image = req.body.image;
            if (req.body.status) room.status = req.body.status;
            if (req.body.capacity !== undefined) room.capacity = req.body.capacity;

            if (req.body.amenities !== undefined) {
                if (typeof req.body.amenities === 'string') {
                    room.amenities = req.body.amenities.split(',').map(i => i.trim());
                } else {
                    room.amenities = req.body.amenities;
                }
            }

            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a Room
// @route   DELETE /api/rooms/:id
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            await room.deleteOne();
            res.json({ message: 'Room Deleted Successfully' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getRooms, 
    getRoom, 
    createRoom, 
    updateRoom, 
    deleteRoom 
};