const User = require('../models/User');

// --- Register User ---
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, secretKey } = req.body;
        
        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 2. Assign Role
        let role = 'guest'; 
        if (secretKey === 'admin125') {
            role = 'admin';
        }

        // 3. Create User
        const user = await User.create({
            name, 
            email, 
            password, 
            phone: phone || "", 
            role: role 
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: `Account Created! Role: ${role.toUpperCase()}`
            });
        }
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
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || "",
                address: user.address || "",
                message: "Login Successful!"
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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

            // Note: Password update logic moved to separate secure function
            
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

        // Direct comparison (since we aren't using bcrypt yet based on your login logic)
        // If you add bcrypt later, change this to: await bcrypt.compare(oldPassword, user.password)
        if (user.password !== oldPassword) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        // Update Password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ IMPORTANT: Export ALL functions
module.exports = { registerUser, loginUser, updateUserProfile, changePassword };