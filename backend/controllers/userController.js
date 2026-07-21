const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => {
    const secret = process.env.JWT_SECRET || 'luxurystay_fallback_jwt_secret_2024';
    return jwt.sign({ id }, secret, {
        expiresIn: '30d'
    });
};

// --- Register User ---
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, secretKey } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let role = 'guest'; 
        if (secretKey === 'admin125') {
            role = 'admin';
        }

        let hashedPassword = password;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (hashError) {
            console.error('Password hashing failed:', hashError);
            return res.status(500).json({ message: 'Failed to secure password. Please try again.' });
        }

        const user = await User.create({
            name, 
            email, 
            password: hashedPassword, 
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
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

// --- Login User ---
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(password, user.password);
        } catch (compareError) {
            console.error('Password comparison failed:', compareError);
            return res.status(500).json({ message: 'Authentication error. Please try again.' });
        }

        if (passwordMatch) { 
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
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message || 'Login failed' });
    }
};

// --- Google Login / Register ---
const googleLogin = async (req, res) => {
    try {
        const { credential, access_token, action } = req.body;

        if (!credential && !access_token) {
            return res.status(400).json({ message: 'Google credential or access_token is required' });
        }

        if (!action || !['login', 'register'].includes(action)) {
            return res.status(400).json({ message: 'Action must be "login" or "register"' });
        }

        let email, name, googleId;

        if (credential) {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
        } else {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            if (!response.ok) {
                return res.status(401).json({ message: 'Invalid Google access token' });
            }
            const data = await response.json();
            email = data.email;
            name = data.name;
            googleId = data.sub;
        }

        let user = await User.findOne({ email });

        if (action === 'login') {
            if (!user) {
                return res.status(400).json({ message: 'Account not found. Please sign up first.' });
            }
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }

        if (action === 'register') {
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
            message: 'Google authentication successful!'
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
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- Change User Password (Secure) ---
const changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Old and new password are required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(oldPassword, user.password);
        } catch (compareError) {
            console.error('Password comparison failed:', compareError);
            return res.status(500).json({ success: false, message: "Authentication error. Please try again." });
        }

        if (!passwordMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("Password Change Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, changePassword, googleLogin };