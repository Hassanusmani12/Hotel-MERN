const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Room = require('./models/Room');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern');
        console.log('✅ MongoDB Connected for seeding...');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@luxurystay.com' });

        if (adminExists) {
            console.log('ℹ️  Admin user already exists, skipping...');
            return;
        }

        const hashedPassword = await bcrypt.hash('Adminyt666@', 10);

        const admin = await User.create({
            name: 'Admin',
            email: 'admin@luxurystay.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log('   Email: admin@luxurystay.com');
        console.log('   Password: Adminyt666@');
        console.log('   Role: admin');
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

const seedRooms = async () => {
    try {
        const existingRooms = await Room.countDocuments();
        if (existingRooms > 0) {
            console.log(`ℹ️  ${existingRooms} rooms already exist, clearing and reseeding...`);
            await Room.deleteMany({});
        }

        const rooms = [
            {
                roomNumber: '101',
                type: 'Presidential Suite',
                price: 850,
                description: 'Experience ultimate luxury in our Presidential Suite featuring panoramic city views, a private jacuzzi, and exclusive 24/7 room service.',
                amenities: ['Jacuzzi', 'Private Balcony', 'King Bed', 'Mini Bar'],
                images: [],
                capacity: 2,
                status: 'Available'
            },
            {
                roomNumber: '102',
                type: 'Executive Business King',
                price: 450,
                description: 'Designed for the modern business traveler, this suite offers a spacious workstation, premium bedding, and a peaceful environment for maximum productivity.',
                amenities: ['King Bed', 'Work Desk', 'High-Speed WiFi', 'Coffee Maker'],
                images: [],
                capacity: 2,
                status: 'Available'
            },
            {
                roomNumber: '201',
                type: 'Ocean View Deluxe',
                price: 550,
                description: 'Wake up to breathtaking ocean views. This deluxe room features contemporary styling, a plush queen bed, and a state-of-the-art entertainment system.',
                amenities: ['Queen Bed', 'Ocean View', 'Smart TV', 'Room Service'],
                images: [],
                capacity: 2,
                status: 'Available'
            },
            {
                roomNumber: '202',
                type: 'Family Penthouse',
                price: 700,
                description: 'Perfect for family getaways. This spacious penthouse includes two separate bedrooms, a cozy living area, and a fully equipped kitchenette for your convenience.',
                amenities: ['2 Bedrooms', 'Kitchenette', 'Kids Area', 'Lounge'],
                images: [],
                capacity: 6,
                status: 'Available'
            },
            {
                roomNumber: '301',
                type: 'Honeymoon Villa',
                price: 950,
                description: 'A romantic retreat designed exclusively for couples. Enjoy complete privacy with your own plunge pool, luxurious spa bath, and complimentary champagne on arrival.',
                amenities: ['Private Pool', 'Spa Bath', 'Champagne', 'King Bed'],
                images: [],
                capacity: 2,
                status: 'Available'
            },
            {
                roomNumber: '302',
                type: 'Alpine Mountain Lodge',
                price: 490,
                description: 'Cozy up by the stone fireplace while enjoying breathtaking views of the mountain peaks from your private cedar balcony.',
                amenities: ['Fireplace', 'Mountain View', 'Balcony', 'King Bed'],
                images: [],
                capacity: 2,
                status: 'Available'
            },
            {
                roomNumber: '401',
                type: 'Royal Classic Suite',
                price: 310,
                description: 'Step back in time with elegance. This room features vintage-inspired decor, rich velvet furnishings, and modern comforts for a timeless stay.',
                amenities: ['Queen Bed', 'Antique Decor', 'City View', 'Mini Bar'],
                images: [],
                capacity: 2,
                status: 'Available'
            },
            {
                roomNumber: '402',
                type: 'Sky High Penthouse',
                price: 780,
                description: 'Perched on the highest floor, this penthouse offers futuristic smart home automation, high-end luxury lounging, and a stunning perspective of the skyline.',
                amenities: ['Rooftop Access', 'Smart Home', 'Infinity View', 'Lounge'],
                images: [],
                capacity: 4,
                status: 'Available'
            }
        ];

        await Room.insertMany(rooms);
        console.log(`✅ ${rooms.length} sample rooms seeded successfully!`);
    } catch (error) {
        console.error('❌ Error seeding rooms:', error.message);
    }
};

const runSeeder = async () => {
    await connectDB();
    await seedAdmin();
    await seedRooms();

    console.log('\n🎉 Seeding completed successfully!');
    console.log('👤 Admin Login: admin@luxurystay.com / Adminyt666@');
    console.log('🏨 Total rooms seeded: 8\n');

    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
    process.exit(0);
};

runSeeder().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
