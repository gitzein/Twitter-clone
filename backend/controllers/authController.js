const generateTokenAndSetCookie = require("../lib/utils/generateToken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  const { fullName, username, password, email } = req.body;

  if (!fullName || !username || !password || !email)
    return res.status(400).json({ message: "All fields are required" });

  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ message: "Invalid email format" });

  const existingUser = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (existingUser)
    return res.status(409).json({ message: "Username already taken" });

  const existingEmail = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (existingEmail)
    return res.status(409).json({ message: "Email already taken" });

  const hashedPwd = await bcrypt.hash(password, 10); // 10 sat rounds

  const newUser = new User({ fullName, username, email, password: hashedPwd });

  if (newUser) {
    generateTokenAndSetCookie(newUser._id, res);
    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      username: newUser.username,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    });
  } else {
    res.status(400), json({ message: "Invalid user data" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username & password are required." });
  const foundUser = await User.findOne({ username }).lean().exec();

  if (!foundUser)
    return res
      .status(400)
      .json({ message: `User ${username} does not exixt.` });

  const matchPwd = await bcrypt.compare(password, foundUser.password);

  if (!matchPwd) return res.status(401).json({ message: "Unauthorized" });

  generateTokenAndSetCookie(foundUser._id, res);

  res.status(200).json({
    id: foundUser._id,
    fullname: foundUser.fullname,
    username: foundUser.username,
    email: foundUser.email,
    followers: foundUser.followers,
    following: foundUser.following,
    profileImg: foundUser.profileImg,
    coverImg: foundUser.coverImg,
  });
};

const logout = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); // No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "strict", secure: true });
  res.json({ message: "Logged out successfully" });
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { signup, login, logout, getMe };
