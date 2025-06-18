const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Invalid email format"]
  },
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
