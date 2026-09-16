const morgan = require("morgan");
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;

// JSON middleware
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api", healthRoutes);
app.use("/api", userRoutes);

// Error middleware - LAST
app.use(errorHandler);

// Database
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});