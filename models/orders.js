const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Shipped", "Delivered", "Cancelled"], default: "Pending" }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;
