require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

const healthRoutes = require("./routes/healthRoutes");

app.use("/api", userRoutes);
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});