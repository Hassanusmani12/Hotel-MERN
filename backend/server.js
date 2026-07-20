const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const amenityRoutes = require('./routes/amenityRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(express.json()); 

const allowedOrigins = [
    'https://hotel-mern-kappa.vercel.app',
    'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// ✅ FIX: Use 127.0.0.1 instead of localhost (Crucial for Login)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern'; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/amenities', amenityRoutes);

app.get('/', (req, res) => {
  res.send('LuxuryStay Backend is Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is flying on port ${PORT}`);
});