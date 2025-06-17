const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const authenticateToken = require("../middleware/auth");
const mongoose = require("mongoose");

/**
 * @swagger
 * tags:
 *   - name: "Products"
 *     description: "Product management routes"
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: ["Products"]
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: A list of products
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: ["Products"]
 *     summary: Get a product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(req.params.id);
    product
      ? res.json(product)
      : res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     tags: ["Products"]
 *     summary: Create a new product
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticateToken, async (req, res) => {
  const { name, price, category } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const product = new Product({ name, price, category });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: ["Products"]
 *     summary: Update a product
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
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    updated
      ? res.json(updated)
      : res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: ["Products"]
 *     summary: Delete a product
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
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const deleted = await Product.findByIdAndDelete(req.params.id);
    deleted
      ? res.json({ message: "Product deleted successfully" })
      : res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

module.exports = router;
