const User = require("../models/User");
const jwt = require("jsonwebtoken");

const protectRoute = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded)
    return res.status(401).json({ message: "Unauthorized: Invalid token" });

  const user = await User.findById(decoded.userId).select("-password");

  if (!user) return res.status(401).json({ message: "User not found" });

  req.user = user;
  next();
};

module.exports = protectRoute;
