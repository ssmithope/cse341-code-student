require("dotenv").config();

const express = require("express");
const app = express(); 

// Swagger setup (before routes)
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
const mongoose = require("mongoose");
const cors = require("cors");
const authenticateToken = require("./middleware/auth");

// Routes (Ensuring Products Are Registered)
const swaggerRoutes = require("./routes/swagger");
const contactsRoutes = require("./routes/contacts");
const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");

// Middleware setup
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// API Routes (Ensuring `/products` appears correctly)
app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);
app.use("/products", productsRoutes); 
app.use("/", swaggerRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to my API!");
});

// MongoDB Setup
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
});

// Handle Graceful Shutdown
process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
});

// Export app for external use
module.exports = app;
