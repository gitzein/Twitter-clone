const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/", protectRoute, notificationController.getAllNotification);
router.delete("/", protectRoute, notificationController.deleteNotification);

module.exports = router;
