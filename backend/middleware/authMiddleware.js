const User = require('../models/User');

// --- Simple Protect Middleware ---
// Filhal ke liye ye direct allow karega taaki server crash na ho.
// Jab aap JWT lagayenge tab hum isay update kar denge.

const protect = async (req, res, next) => {
    try {
        // Filhal hum user check skip kar rahe hain taaki aapka kaam na ruke.
        // Future mein yahan Token verification aayega.
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized' });
    }
};

module.exports = { protect };