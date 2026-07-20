const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// --- Register User ---
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, secretKey } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        let role = 'guest'; 
        if (secretKey === 'admin125') {
            role = 'admin';
        }

        const user = await User.create({
            name, 
            email, 
            password, 
            phone: phone || "", 
            role: role 
        });

        const token = signToken(user._id);

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
            message: `Account Created! Role: ${role.toUpperCase()}`
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- Login User ---
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && user.password === password) { 
            const token = signToken(user.id);
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || "",
                address: user.address || "",
                token,
                message: "Login Successful!"
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Google Login / Register ---
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: name || 'Google User',
                email,
                googleId,
                password: googleId,
                role: 'guest'
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const token = signToken(user._id);

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || "",
            address: user.address || "",
            token,
            message: user.googleId ? 'Google Login Successful!' : 'Account linked with Google!'
        });
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
};

// --- Update User Profile (Details Only) ---
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId); 

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address,
                message: 'Profile Updated Successfully!'
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Change User Password (Secure) ---
const changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.password !== oldPassword) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, changePassword, googleLogin };