const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { 
    type: Number, 
    required: true, 
    min: [0, "Price must be a non-negative number"]
  },
  category: { 
    type: String, 
    required: true, 
    enum: ["Electronics", "Clothing", "Books", "Home", "Other"]
  },
  stock: {
    type: Number,
    required: true,
    min: [0, "Stock quantity must be a non-negative number"]
  }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
module.exports = Product;
