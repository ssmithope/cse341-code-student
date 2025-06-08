const express = require("express");
const mongoose = require("mongoose");
const swaggerRoutes = require("./routes/swagger");
const contactsRoutes = require("./routes/contacts");

const app = express();
const PORT = process.env.PORT || 3000;

// Suppress the Mongoose warning
mongoose.set("strictQuery", false);

// Middleware
app.use(express.json());

// Routes
app.use("/contacts", contactsRoutes);
app.use("/", swaggerRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to my API!");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/myDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
