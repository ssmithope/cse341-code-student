const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"]},
    password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
