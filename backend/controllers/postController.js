const Notification = require("../models/Notification");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { v2: cloudinary } = require("cloudinary");

const createPost = async (req, res) => {
  const userId = req.user._id;
  const { text } = req.body;
  let { img } = req.body;

  if (!text && !img)
    return res.status(400).json({ message: "Post cannot be empty" });

  if (img) {
    const uploadResult = await cloudinary.uploader.upload(img);
    img = uploadResult.secure_url;
  }

  const newPost = new Post({ text, img, user: userId });

  await newPost.save();

  return res.status(201).json(newPost);
};

const likeOrUnlikePost = async (req, res) => {
  const userId = req.user._id;
  const postId = req.params.id;

  const post = await Post.findById(postId).exec();
  const user = await User.findById(userId).exec();

  if (!post) return res.status(400).json({ message: "Post doesn't exist" });

  const isPostLiked = post.likes.indexOf(userId);
  if (isPostLiked !== -1) {
    // Unlike
    const likedPostIndex = user.likedPosts.indexOf(postId);
    post.likes.splice(isPostLiked, 1);
    user.likedPosts.splice(likedPostIndex, 1);
  } else {
    // Like
    post.likes.push(userId);
    user.likedPosts.push(postId);
    if (userId != post.user.toString()) {
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
    }
  }
  await user.save();
  await post.save();
  res.json(post.likes);
};

const commentPost = async (req, res) => {
  const userId = req.user._id;
  const postId = req.params.id;
  const { text } = req.body;
  let { img } = req.body;

  if (!text)
    return res.status(400).json({ message: "Comment cannot be empty text" });

  const post = await Post.findById(postId).exec();

  if (!post) return res.status(400).json({ message: "Post doesn't exist" });

  const newComment = new Comment({ from: userId, to: postId, img, text });

  await newComment.save();

  if (newComment?._id) {
    post.comments.push(newComment?._id);
    await post.save();
    if (userId.toString() !== post.user.toString()) {
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "comment",
      });
      await notification.save();
    }
  }

  res.json(post.comments);
};

const deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId).lean().exec();
  if (!post) return res.status(400).json({ message: "Post doesn't exixt" });

  if (post.user.toString() !== userId.toString())
    return res.status(401).json({ message: "Unauthorized" });

  if (post.img) {
    const imgId = post.img.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imgId);
  }

  await Post.findByIdAndDelete(postId);
  res.json({ message: "Post deleted" });
};

const getAllPosts = async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "-password -email" })
    .populate({
      path: "comments",
      populate: {
        path: "from",
        select: "username fullName profileImg _id",
      },
    })
    .lean()
    .exec();
  if (posts.length === 0) return res.status(204).json([]);

  res.json(posts);
};

const getLikedPosts = async (req, res) => {
  const likedPostsIds = req.user.likedPosts;

  const likedPosts = await Post.find({ _id: likedPostsIds })
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "-password -email" })
    .populate({
      path: "comments",
      populate: {
        path: "from",
        select: "username fullName profileImg _id",
      },
    })
    .lean()
    .exec();

  res.json(likedPosts);
};

const getFollowingPosts = async (req, res) => {
  const followeduser = req.user.following;

  const followingPosts = await Post.find({ user: followeduser })
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "-password -email" })
    .populate({
      path: "comments",
      populate: {
        path: "from",
        select: "username fullName profileImg _id",
      },
    })
    .lean()
    .exec();

  res.json(followingPosts);
};

const getUserPosts = async (req, res) => {
  const username = req.params.username;

  const foundUser = await User.findOne({ username }).lean().exec();

  if (!foundUser) return res.status(400).json({ message: "User not found" });

  const userPosts = await Post.find({ user: foundUser._id })
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "-password -email" })
    .populate({
      path: "comments",
      populate: {
        path: "from",
        select: "username fullName profileImg _id",
      },
    })
    .lean()
    .exec();

  res.json(userPosts);
};

const updatePost = async (req, res) => {
  const postId = req.params.id;
  const text = req.body.text;

  const post = await Post.findById(postId).exec();

  if (!post) return res.status(400).json({ message: "Post not found" });

  if (post.user.toString() !== req.user._id.toString())
    return res.status(401).json({ message: "Unauthorized" });

  post.text = text;
  post.isEdited = true;

  await post.save();

  res.json(post);
};

const getSinglePost = async (req, res) => {
  const postId = req.params.id;

  const post = await Post.findById(postId)
    .populate({ path: "user", select: "-password -email" })
    .populate({
      path: "comments",
      populate: {
        path: "from",
        select: "username fullName profileImg _id",
      },
    })
    .lean()
    .exec();

  if (!post) return res.status(400).json({ message: "Post not found" });
  res.json(post);
};

const editComment = async (req, res) => {
  const userId = req.user._id;
  const commentId = req.params.id;
  const { text } = req.body;

  const comment = await Comment.findById(commentId).exec();
  if (!comment) return res.status(400).json({ message: "Comment not found" });
  if (comment.from.toString() !== userId.toString())
    return res.status(401).json({ message: "Unauthorized" });

  comment.text = text;
  comment.isEdited = true;
  await comment.save();

  const post = await Post.findById(comment.to)
    .populate({
      path: "comments",
      populate: {
        path: "from",
        select: "username fullName profileImg _id",
      },
    })
    .lean()
    .exec();
  if (!post) return res.status(400).json({ message: "Post no longer exist" });

  res.json(post.comments);
};

const deleteComment = async (req, res) => {
  const userId = req.user._id;
  const commentId = req.params.id;

  const comment = await Comment.findById(commentId).lean().exec();
  if (!comment) return res.status(400).json({ message: "Comment not found" });
  if (comment.from.toString() !== userId.toString())
    return res.status(401).json({ message: "Unauthorized" });

  await Comment.findByIdAndDelete(commentId);
  res.json({ message: "Comment deleted" });
};

const likeComment = async (req, res) => {
  const userId = req.user._id;
  const commentId = req.params.id;

  const comment = await Comment.findById(commentId).exec();
  if (!comment) return res.status(400).json({ message: "Comment not found" });

  const isLiked = comment.likes.indexOf(userId);

  if (isLiked === -1) {
    //like
    comment.likes.push(userId);
    if (userId.toString() !== commentId) {
      const notification = new Notification({
        from: userId,
        to: comment.from,
        type: "likeComment",
      });
      await notification.save();
    }
  } else {
    //unlike
    comment.likes.splice(isLiked, 1);
  }

  await comment.save();
  res.json(comment.likes);
};

module.exports = {
  createPost,
  likeOrUnlikePost,
  commentPost,
  deletePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  updatePost,
  getSinglePost,
  editComment,
  deleteComment,
  likeComment,
};
