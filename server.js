require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const swaggerRoutes = require("./routes/swagger");
const contactsRoutes = require("./routes/contacts");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware (Ensure correct execution order)
app.use(express.json());  

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// Suppress Mongoose strictQuery warning
mongoose.set("strictQuery", false);

// Routes
app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);
app.use("/", swaggerRoutes);

// Default Route
app.get("/", (req, res) => {
    res.send("Welcome to my API!");
});

// MongoDB Connection Handling
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log("Connected to MongoDB"); 
}).catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
