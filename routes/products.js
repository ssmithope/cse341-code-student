const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const authenticateToken = require("../middleware/auth");

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: A list of products
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the product to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product
      ? res.json(product)
      : res.status(404).json({ error: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

/**
 * @swagger
 * /products:
 *   post:
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
    res.status(500).json({ message: "Error creating product" });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the product to update
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
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    updated
      ? res.json(updated)
      : res.status(404).json({ error: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    deleted
      ? res.json({ message: "Product deleted successfully" })
      : res.status(404).json({ error: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
