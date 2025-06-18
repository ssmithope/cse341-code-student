require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// Initialize Express app
const app = express();
const PORT = process.env.NODE_ENV === "test" ? 0 : process.env.PORT || 10000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Session management for OAuth authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Debugging session data
app.use((req, res, next) => {
  console.log("Session Data:", req.session);
  next();
});

// Import Passport configuration
require("./config/passport");

// Swagger API documentation setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import routes
const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const contactsRoutes = require("./routes/contacts");
const swaggerRoutes = require("./routes/swagger");

// Register routes
app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/users", usersRoutes);
app.use("/orders", ordersRoutes);
app.use("/contacts", contactsRoutes);
app.use("/", swaggerRoutes);

// Default Route
app.get("/", (req, res) => res.send("Welcome to my API!"));

// MongoDB Connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Graceful shutdown handling for MongoDB
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
  process.exit(0);
});

// Start the server
const server = app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

// Handle server shutdown properly
process.on("SIGTERM", async () => {
  console.log("Shutting down server...");
  await mongoose.disconnect();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

// Export app for testing
module.exports = app;
