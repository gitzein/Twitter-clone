const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const postController = require("../controllers/postController");

router.get("/all", protectRoute, postController.getAllPosts);
router.get("/posts", protectRoute, postController.getPostsPaginated);
router.get("/user/:username", protectRoute, postController.getUserPosts);
router.get("/following", protectRoute, postController.getFollowingPosts);
router.get("/likes/:id", protectRoute, postController.getLikedPosts);
router.get("/post/:id", protectRoute, postController.getSinglePost);
router.post("/create", protectRoute, postController.createPost);
router.post("/like/:id", protectRoute, postController.likeOrUnlikePost);
router.post("/update/:id", protectRoute, postController.updatePost);
router.delete("/delete/:id", protectRoute, postController.deletePost);
router.post("/comment/:id", protectRoute, postController.commentPost);
router.post("/comment/update/:id", protectRoute, postController.editComment);
router.delete("/comment/:id", protectRoute, postController.deleteComment);
router.post("/comment/like/:id", protectRoute, postController.likeComment);
router.post("/post/save/:id", protectRoute, postController.savePost);
router.get("/save", protectRoute, postController.getSavedPostsPaginated);
router.post("/retweet/:id", protectRoute, postController.retweetPost);
router.get("/liked/:id", protectRoute, postController.getLikedPostsPaginated);

module.exports = router;
