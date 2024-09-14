require("dotenv").config();
require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const cookieParser = require("cookie-parser");
const app = express();

const PORT = process.env.PORT || 3500;

connectDB();

app.use(express.json()); // to parse req.body

app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));

mongoose.connection.once("connected", () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
