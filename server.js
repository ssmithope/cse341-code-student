require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authenticateToken = require("./middleware/auth");
const app = express();

// Define the port for Render
const PORT = process.env.PORT || 10000;

// Swagger setup
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware setup
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
const swaggerRoutes = require("./routes/swagger");
const contactsRoutes = require("./routes/contacts");
const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");

// API Routes
app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
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

// Graceful shutdown
process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
});

// Prevent multiple instances during testing
if (!module.parent) {
    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    // Handle server shutdown properly
    process.on("SIGTERM", async () => {
        console.log("Shutting down server...");
        await mongoose.disconnect();
        server.close(() => {
            console.log("Server closed.");
            process.exit(0);
        });
    });
}

// Export app for external use (important for testing)
module.exports = app;
