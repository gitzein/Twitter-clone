const express = require("express");
const authController = require("../controllers/authController");
const protectRoute = require("../middleware/protectRoute");
const router = express.Router();

router.get("/me", protectRoute, authController.getMe);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
