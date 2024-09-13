const express = require("express");
const router = express.Router();

router.get("/signup", (req, res) => {
  res.json({ message: "You hit the signup endpoint" });
});
router.get("/login", (req, res) => {
  res.json({ message: "You hit the login endpoint" });
});
router.get("/logout", (req, res) => {
  res.json({ message: "You hit the logout endpoint" });
});

module.exports = router;
