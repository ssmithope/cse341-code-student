require("dotenv").config();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
console.log("MongoDB URI:", process.env.MONGODB_URI);
console.log("JWT Secret:", process.env.JWT_SECRET);
 // Debugging check

const express = require("express");
const mongoose = require("mongoose");
const swaggerRoutes = require("./routes/swagger");
const contactsRoutes = require("./routes/contacts");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// Suppress Mongoose strictQuery warning
mongoose.set("strictQuery", false);

// Middleware
app.use(express.json());

// Routes
app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);
app.use("/", swaggerRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to my API!");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
