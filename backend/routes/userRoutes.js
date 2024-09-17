const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/profile/:username", protectRoute, userController.getUserProfile);
router.get("/suggested", protectRoute, userController.getSuggestedUser);
router.post("/follow/:id", protectRoute, userController.followOrUnfollowUser);
router.post("/update", protectRoute, userController.updateUser);

module.exports = router;
