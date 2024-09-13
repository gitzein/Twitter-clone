require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const app = express();

const PORT = process.env.PORT || 3500;

connectDB();

app.use("/api/auth", require("./routes/authRoutes"));

mongoose.connection.once("connected", () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
