const express = require("express");
const router = express.Router();
const User = require("../models/users");
const authenticateToken = require("../middleware/auth");
const mongoose = require("mongoose");

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(req.params.id);
    user
      ? res.json(user)
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 */
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newUser = await User.create({ name, email, password });
    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     security:
 *       - BearerAuth: []
 */
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     security:
 *       - BearerAuth: []
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    deletedUser
      ? res.json({ message: "User deleted successfully" })
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
