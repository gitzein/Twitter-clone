require("dotenv").config();
require("express-async-errors");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const cookieParser = require("cookie-parser");
const app = express();
const { v2: cloudinary } = require("cloudinary");

const PORT = process.env.PORT || 3500;
__dirname = path.resolve();

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "5mb" })); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/notification", require("./routes/notificationRoutes"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

mongoose.connection.once("connected", () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
