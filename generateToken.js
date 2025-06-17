require("dotenv").config();

const jwt = require("jsonwebtoken");

// Replace with an actual test user or payload structure
const payload = { email: "test@example.com", role: "user" };

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

console.log("Your test JWT:\n", token);
