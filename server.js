require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();
const PORT = process.env.NODE_ENV === "test" ? 0 : process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "testsecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

require("./config/passport");

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/products", require("./routes/products"));
app.use("/users", require("./routes/users"));
app.use("/orders", require("./routes/orders"));
app.use("/contacts", require("./routes/contacts"));
app.use("/", require("./routes/swagger"));

app.get("/", (req, res) => res.send("Welcome to my API!"));

// MongoDB connection
mongoose.set("strictQuery", false);

const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to MongoDB");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    setTimeout(connectWithRetry, 5000);
  }
};
connectWithRetry();

mongoose.connection.on("disconnected", () => {
  if (!global.shuttingDown && mongoose.connection.readyState === 0) {
    console.error("MongoDB disconnected! Retrying...");
    connectWithRetry();
  }
});

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );

  const shutdownServer = async () => {
    if (!global.shuttingDown) {
      global.shuttingDown = true;
      console.log("Shutting down server...");
      await mongoose.connection.close();
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    }
  };

  process.on("SIGINT", shutdownServer);
  process.on("SIGTERM", shutdownServer);
  process.on("exit", shutdownServer);
  process.on("uncaughtException", (err) =>
    console.error("Unhandled Exception:", err)
  );
  process.on("unhandledRejection", (reason) =>
    console.error("Unhandled Promise Rejection:", reason)
  );
}

module.exports = app;
