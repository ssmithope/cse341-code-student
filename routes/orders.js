const express = require("express");
const router = express.Router();
const Order = require("../models/orders");

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: ["Orders"]
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: A list of orders
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().populate("products user"); 
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: ["Orders"]
 *     summary: Create a new order
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - user
 *               - quantity
 *               - totalPrice
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Product ID(s)
 *               user:
 *                 type: string
 *                 description: User ID
 *               quantity:
 *                 type: number
 *                 description: Total quantity of products ordered
 *               totalPrice:
 *                 type: number
 *                 description: Total price for the order
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request - Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", async (req, res) => {
    try {
        const { products, user, quantity, totalPrice } = req.body;
        if (!products || !user || !quantity || !totalPrice) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     tags: ["Orders"]
 *     summary: Update an order by ID
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
 *               status:
 *                 type: string
 *                 enum: ["Pending", "Shipped", "Delivered", "Cancelled"]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Bad request - Invalid update
 *       500:
 *         description: Internal server error
 */
router.put("/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error updating order", error: error.message });
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     tags: ["Orders"]
 *     summary: Delete an order by ID
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
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting order", error: error.message });
    }
});

module.exports = router;
