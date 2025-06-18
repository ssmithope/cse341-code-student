const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/users");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: "Users"
 *     description: "User management routes"
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: ["Users"]
 *     summary: Get all users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *       404:
 *         description: No users found
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password field for security
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: ["Users"]
 *     summary: Get a user by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(req.params.id).select("-password");
    user
      ? res.json(user)
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags: ["Users"]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Missing required fields or email already in use
 *       500:
 *         description: Internal server error
 */
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Exclude password in response for security
    const responseUser = newUser.toObject();
    delete responseUser.password;

    res.status(201).json({ user: responseUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: ["Users"]
 *     summary: Update a user by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid request or invalid ID format
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const updateData = { ...req.body };

    // Hash password if provided
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    updatedUser
      ? res.json({ user: updatedUser })
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: ["Users"]
 *     summary: Delete a user by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
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
