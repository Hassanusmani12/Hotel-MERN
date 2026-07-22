const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Helper to set no-cache headers
const setNoCache = (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
};

// --- 1. Get ALL Bookings (Admin VVIP View) ---
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email phone') 
            .populate('room', 'type roomNumber price') 
            .sort({ createdAt: -1 });

        setNoCache(res);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 2. Create New Booking ---
const createBooking = async (req, res) => {
    try {
        const {
            roomId, userId, checkInDate, checkOutDate,
            paymentMethod, paymentType, paymentStatus,
            totalAmount, totalPrice, amount
        } = req.body;

        if (!roomId || !userId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        if (start >= end) {
            return res.status(400).json({ message: "Check-out date must be after Check-in date" });
        }

        const resolvedMethod = paymentMethod || paymentType || 'card';
        const resolvedTotal = Number(totalAmount) || Number(totalPrice) || Number(amount) || 0;
        const resolvedStatus = paymentStatus
            || (resolvedMethod === 'cash' || resolvedMethod === 'cash_at_counter' ? 'Unpaid' : 'Paid');

        const booking = await Booking.create({
            room: roomId,
            user: userId,
            checkInDate,
            checkOutDate,
            status: 'Confirmed',
            paymentMethod: resolvedMethod,
            paymentStatus: resolvedStatus,
            totalAmount: resolvedTotal,
            totalPrice: resolvedTotal
        });

        setNoCache(res);
        res.status(201).json({ message: "Room Booked Successfully!", booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 3. Get User Bookings ---
const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ user: userId })
            .populate('room') 
            .sort({ createdAt: -1 });

        setNoCache(res);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. Cancel Booking (Soft cancel with 24-hour window) ---
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const hoursDiff = (Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
            return res.status(400).json({ message: "Cancellation period has expired. Bookings can only be cancelled within 24 hours." });
        }

        booking.status = 'Cancelled';
        await booking.save();
        setNoCache(res);
        res.status(200).json({ message: "Booking Cancelled Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 5. Delete Booking (Admin only — permanent hard delete) ---
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        await Booking.findByIdAndDelete(req.params.id);
        setNoCache(res);
        res.json({ message: 'Booking permanently deleted from database' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllBookings, createBooking, getUserBookings, cancelBooking, deleteBooking };