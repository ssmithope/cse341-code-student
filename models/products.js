const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Product name is required"], 
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"], 
    min: [0, "Price must be a non-negative number"]
  },
  category: { 
    type: String, 
    required: [true, "Category is required"], 
    enum: ["Electronics", "Clothing", "Books", "Home", "Other"]
  },
  stock: {
    type: Number,
    required: [true, "Stock quantity is required"],
    min: [0, "Stock quantity must be a non-negative number"],
    default: 0
  }
}, { timestamps: true });

// Prevent redefining model in test environments
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
module.exports = Product;
