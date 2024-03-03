const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Registering user: ${username}`);
    try {
        let user = await User.findOne({ username: username.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user = new User({ username: username.toLowerCase(), password: hashedPassword });
        await user.save();
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error("Error registering new user:", error);
        res.status(500).json({ message: "Error registering new user", error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            console.log(`User not found for username: ${username}`);
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match for user ${username}: ${isMatch}`);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

module.exports = router;