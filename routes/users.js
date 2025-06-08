const express = require('express');
const router = express.Router();
const User = require('../models/users'); 

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user ? res.json(user) : res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE a new user
router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE user by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        updatedUser ? res.json({ message: "User updated successfully", user: updatedUser }) : res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE user by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        deletedUser ? res.json({ message: "User deleted successfully" }) : res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
