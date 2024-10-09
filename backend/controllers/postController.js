const Notification = require("../models/Notification");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { v2: cloudinary } = require("cloudinary");
const { default: mongoose } = require("mongoose");

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
  const user = req.user;
  const postId = req.params.id;

  const isValidObjectId = mongoose.isObjectIdOrHexString(postId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Post not found" });

  const post = await Post.findById(postId).exec();

  if (!post) return res.status(400).json({ message: "Post doesn't exist" });

  const isPostLiked = post.likes.indexOf(user._id);
  if (isPostLiked !== -1) {
    // Unlike
    const likedPostIndex = user.likedPosts.indexOf(postId);
    post.likes.splice(isPostLiked, 1);
    user.likedPosts.splice(likedPostIndex, 1);
  } else {
    // Like
    post.likes.push(user._id);
    user.likedPosts.push(postId);
    if (user._id != post.user.toString()) {
      const notification = new Notification({
        from: user._id,
        to: post.user,
        type: "like",
        ref: post._id.toString(),
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

  const isValidObjectId = mongoose.isObjectIdOrHexString(postId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Post not found" });

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
        ref: post._id.toString(),
      });
      await notification.save();
    }
  }

  res.json(post.comments);
};

const deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const isValidObjectId = mongoose.isObjectIdOrHexString(postId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Post not found" });

  const post = await Post.findById(postId).lean().exec();
  if (!post) return res.status(400).json({ message: "Post doesn't exixt" });

  if (post.user.toString() !== userId.toString())
    return res.status(401).json({ message: "Unauthorized" });

  if (post.img) {
    const imgId = post.img.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imgId);
  }

  if (post.comments.length > 0) {
    await Comment.deleteMany({ to: postId });
  }

  await Post.findByIdAndDelete(postId);
  res.json({ message: "Post deleted" });
};

const getAllPosts = async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "_id username fullName profileImg" })
    .populate({
      path: "postReference",
      populate: { path: "user", select: "_id username fullName profileImg" },
    })
    .lean()
    .exec();
  if (posts.length === 0) return res.status(204).json([]);

  res.json(posts);
};

const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  const { cursor, limit = 10 } = req.query;

  const isValidObjectId = mongoose.isObjectIdOrHexString(userId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "User not found" });

  const user = await User.findById(userId).exec();
  const likedPostsReverse = [...user.likedPosts].reverse();
  const likedPostsReverseIds = likedPostsReverse.map((id) => id.toString());

  let queryIdsArr = likedPostsReverse.slice(0, Number(limit));

  let query = { _id: queryIdsArr };

  if (cursor) {
    const cursorIndex = likedPostsReverseIds.indexOf(cursor) + 1;

    queryIdsArr = likedPostsReverseIds.slice(
      cursorIndex,
      cursorIndex + Number(limit)
    );
    query._id = queryIdsArr;
  }

  const unsortedPosts = await Post.find(query)
    .limit(Number(limit))
    .populate({ path: "user", select: "_id username fullName profileImg" })
    .populate({
      path: "postReference",
      populate: { path: "user", select: "_id username fullName profileImg" },
    })
    .lean()
    .exec();

  const sortedAndValidatedPosts = queryIdsArr
    .map((id) => {
      const post = unsortedPosts.filter(
        (post) => id.toString() === post._id.toString()
      );
      return post[0];
    })
    .filter((post) => post !== undefined);

  // Eiminating id(s) of post that no longer exist (deleted by the author) from user's array of likedPosts
  const postsIds = sortedAndValidatedPosts.map((post) => post._id.toString());
  queryIdsArr.forEach((id) => {
    const index = postsIds.indexOf(id.toString());
    if (index === -1) {
      const indexInMainArr = likedPostsReverse.indexOf(id);

      likedPostsReverse.splice(indexInMainArr, 1);
    }
  });

  user.likedPosts = [...likedPostsReverse].reverse();

  await user.save();

  const prevCursor =
    cursor && sortedAndValidatedPosts.length > 0
      ? sortedAndValidatedPosts[0]._id
      : null;
  const nextCursor =
    sortedAndValidatedPosts.length > 0
      ? sortedAndValidatedPosts[sortedAndValidatedPosts.length - 1]._id
      : null;

  // filtering posts thats not User's own post to be shown on the front end
  const otherUserOnlyPosts = sortedAndValidatedPosts.filter(
    (post) => post.user._id.toString() !== user._id.toString()
  );

  res.json({
    posts: otherUserOnlyPosts,
    prevCursor,
    nextCursor,
    totalResult: sortedAndValidatedPosts.length,
  });
};

const getFollowingPosts = async (req, res) => {
  const followedUser = req.user.following;

  const { cursor, limit = 10 } = req.query;

  let query = { user: followedUser };

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const posts = await Post.find(query)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "_id username fullName profileImg" })
    .populate({
      path: "postReference",
      populate: { path: "user", select: "_id username fullName profileImg" },
    })
    .lean()
    .exec();

  const prevCursor = cursor && posts.length > 0 ? posts[0]._id : null;
  const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

  res.json({
    posts,
    prevCursor,
    nextCursor,
    totalResult: posts.length,
  });
};

const getUserPosts = async (req, res) => {
  const username = req.params.username;

  const { cursor, limit = 10 } = req.query;

  const foundUser = await User.findOne({ username }).lean().exec();

  if (!foundUser) return res.status(400).json({ message: "User not found" });

  let query = { user: foundUser._id };

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const posts = await Post.find(query)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "_id username fullName profileImg" })
    .populate({
      path: "postReference",
      populate: { path: "user", select: "_id username fullName profileImg" },
    })
    .lean()
    .exec();

  const prevCursor = cursor && posts.length > 0 ? posts[0]._id : null;
  const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

  res.json({
    posts,
    prevCursor,
    nextCursor,
    totalResult: posts.length,
  });
};

const updatePost = async (req, res) => {
  const postId = req.params.id;
  const text = req.body.text;

  const isValidObjectId = mongoose.isObjectIdOrHexString(postId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Post not found" });

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

  const isValidObjectId = mongoose.isObjectIdOrHexString(postId);

  if (!isValidObjectId)
    return res.status(400).json({ message: "Post not found" });

  const post = await Post.findById(postId)
    .populate({ path: "user", select: "_id username fullName profileImg" })
    .populate({
      path: "postReference",
      populate: { path: "user", select: "_id username fullName profileImg" },
    })
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

  const isValidObjectId = mongoose.isObjectIdOrHexString(commentId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Comment not found" });

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

  const isValidObjectId = mongoose.isObjectIdOrHexString(commentId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Comment not found" });

  const comment = await Comment.findById(commentId).lean().exec();
  if (!comment) return res.status(400).json({ message: "Comment not found" });
  if (comment.from.toString() !== userId.toString())
    return res.status(401).json({ message: "Unauthorized" });

  const targetedPost = await Post.findById(comment.to).exec();
  if (targetedPost) {
    const commentIndex = targetedPost.comments.indexOf(commentId);
    if (commentIndex !== -1) {
      targetedPost.comments.splice(commentIndex, 1);
      await targetedPost.save();
    }
  }

  await Comment.findByIdAndDelete(commentId);
  res.json({ message: "Comment deleted" });
};

const likeComment = async (req, res) => {
  const userId = req.user._id;
  const commentId = req.params.id;

  const isValidObjectId = mongoose.isObjectIdOrHexString(commentId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Comment not found" });

  const comment = await Comment.findById(commentId).exec();
  if (!comment) return res.status(400).json({ message: "Comment not found" });

  const isLiked = comment.likes.indexOf(userId);

  if (isLiked === -1) {
    //like
    comment.likes.push(userId);
    if (userId.toString() !== comment.from.toString()) {
      const notification = new Notification({
        from: userId,
        to: comment.from,
        type: "likeComment",
        ref: comment.to.toString(),
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

const savePost = async (req, res) => {
  const user = req.user;
  const postId = req.params.id;

  const isValidObjectId = mongoose.isObjectIdOrHexString(postId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Post not found" });

  const post = await Post.findById(postId).lean().exec();

  if (!post) return res.status(400).json({ message: "Post doesn't exist" });

  const isSaved = user.savedPosts.indexOf(postId);

  if (isSaved !== -1) {
    // Unsave
    user.savedPosts.splice(isSaved, 1);
  } else {
    // save
    user.savedPosts.unshift(postId);
  }
  await user.save();
  res.json(user.savedPosts);
};

const getSavedPosts = async (req, res) => {
  const userId = req.user._id;

  const { cursor, limit = 10 } = req.query;

  const user = await User.findById(userId).exec();

  let queryIdsArr = user.savedPosts.slice(0, Number(limit));

  let query = { _id: queryIdsArr };

  if (cursor) {
    const cursorIndex = user.savedPosts.indexOf(cursor) + 1;

    queryIdsArr = user.savedPosts.slice(
      cursorIndex,
      cursorIndex + Number(limit)
    );
    query._id = queryIdsArr;
  }

  const unsortedPosts = await Post.find(query)
    .limit(Number(limit))
    .populate({ path: "user", select: "_id username fullName profileImg" })
    .lean()
    .exec();

  const sortedAndValidatedPosts = user.savedPosts
    .map((id) => {
      const post = unsortedPosts.filter(
        (post) => id.toString() === post._id.toString()
      );
      return post[0];
    })
    .filter((post) => post !== undefined);

  const cpyMainArr = [...user.savedPosts];

  // Eiminating id(s) of post that no longer exist (deleted by the author) from user's array of savedPosts
  const postsIds = sortedAndValidatedPosts.map((post) => post._id.toString());
  queryIdsArr.forEach((id) => {
    const index = postsIds.indexOf(id.toString());
    if (index === -1) {
      const indexInMainArr = cpyMainArr.indexOf(id);

      cpyMainArr.splice(indexInMainArr, 1);
    }
  });

  user.savedPosts = [...cpyMainArr];
  await user.save();

  const prevCursor =
    cursor && sortedAndValidatedPosts.length > 0
      ? sortedAndValidatedPosts[0]._id
      : null;
  const nextCursor =
    sortedAndValidatedPosts.length > 0
      ? sortedAndValidatedPosts[sortedAndValidatedPosts.length - 1]._id
      : null;

  res.json({
    posts: sortedAndValidatedPosts,
    prevCursor,
    nextCursor,
    totalResult: sortedAndValidatedPosts.length,
  });
};

const retweetPost = async (req, res) => {
  const user = req.user;
  const postId = req.params.id;

  const isValidObjectId = mongoose.isObjectIdOrHexString(postId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "Post not found" });

  const post = await Post.findById(postId).exec();

  if (!post) return res.status(400).json({ message: "Post doesn't exist" });

  const isRetweeted = post.retweets.indexOf(user._id);

  if (isRetweeted !== -1) {
    // unretweet(?)
    const postIndexOnUser = user.retweetedPosts.indexOf(postId);

    await Post.findOneAndDelete({ user: user._id, postReference: postId });

    user.retweetedPosts.splice(isRetweeted, 1);
    post.retweets.splice(postIndexOnUser, 1);

    await post.save();
    await user.save();

    res.json(post);
  } else {
    // retweet
    const newRetweetedPost = new Post({
      user: user._id,
      isRetweetedPost: true,
      postReference: postId,
    });
    await newRetweetedPost.save();

    user.retweetedPosts.push(postId);
    post.retweets.push(user._id);
    await post.save();
    await user.save();

    if (user._id != post.user.toString()) {
      const notification = new Notification({
        from: user._id,
        to: post.user,
        type: "retweet",
        ref: post._id.toString(),
      });
      await notification.save();
    }

    res.status(201).json(newRetweetedPost);
  }
};

const getPostsPaginated = async (req, res) => {
  const { cursor, limit = 10 } = req.query;

  let query = {};

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const posts = await Post.find(query)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "_id username fullName profileImg" })
    .populate({
      path: "postReference",
      populate: { path: "user", select: "_id username fullName profileImg" },
    })
    .lean()
    .exec();

  const prevCursor = cursor && posts.length > 0 ? posts[0]._id : null;
  const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

  res.json({ posts, prevCursor, nextCursor, totalResult: posts.length });
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
  savePost,
  getSavedPosts,
  retweetPost,
  getPostsPaginated,
};
