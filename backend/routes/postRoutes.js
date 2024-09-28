const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const postController = require("../controllers/postController");

router.get("/all", protectRoute, postController.getAllPosts);
router.get("/user/:username", protectRoute, postController.getUserPosts);
router.get("/following", protectRoute, postController.getFollowingPosts);
router.get("/likes/:id", protectRoute, postController.getLikedPosts);
router.get("/post/:id", protectRoute, postController.getSinglePost);
router.post("/create", protectRoute, postController.createPost);
router.post("/like/:id", protectRoute, postController.likeOrUnlikePost);
router.post("/comment/:id", protectRoute, postController.commentPost);
router.post("/update/:id", protectRoute, postController.updatePost);
router.delete("/delete/:id", protectRoute, postController.deletePost);

module.exports = router;
