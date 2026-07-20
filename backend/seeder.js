const mongoose = require('mongoose');
const User = require('./models/User');
const Amenity = require('./models/Amenity');

const MONGO_URI = 'mongodb://localhost:27017/mern';

const DEFAULT_AMENITIES = [
    'Free WiFi', 'Private Pool', 'Breakfast', 'Private Gym', 'Spa Access',
    'Gaming Setup', 'Fireplace', 'Ocean View', 'Mountain View', 'Mini Bar',
    'Cinema Room', 'Smart Home', 'Jacuzzi', 'Infinity Pool', 'Private Chef',
    'Coffee Machine', 'Workspace', 'Kids Area', 'Pet Friendly', 'Netflix',
    'Xbox', 'PlayStation', 'BBQ Area', 'Fire Pit', 'Private Garden',
    'Helipad', 'Rooftop', 'Sauna', 'Steam Room', 'Air Conditioning',
    'Room Service', '24/7 Concierge', 'Butler Service', 'Valet Parking',
    'Wine Cellar', 'Yoga Studio', 'Tennis Court', 'Private Beach Access'
];

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Database Connected...');

        await User.deleteMany();
        console.log('🗑️ Purane Users Delete Ho Gaye...');

        const adminUser = {
            name: 'Super Admin',
            email: 'admin@luxurystay.com',
            password: 'admin123',
            phone: '03001234567',
            role: 'admin'
        };

        await User.create(adminUser);

        console.log('🎉 Naya Admin Ban Gaya!');
        console.log('📧 Email: admin@luxurystay.com');
        console.log('🔑 Pass: admin123');

        await Amenity.deleteMany();
        for (const name of DEFAULT_AMENITIES) {
            await Amenity.create({ name });
        }
        console.log(`🏷️ ${DEFAULT_AMENITIES.length} Default Amenities Created!`);

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

importData();