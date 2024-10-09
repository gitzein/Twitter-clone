const Notification = require("../models/Notification");
const { v2: cloudinary } = require("cloudinary");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");
const Post = require("../models/Post");

const getUserProfile = async (req, res) => {
  const { username } = req.params;

  const foundUser = await User.findOne({ username })
    .select("-password")
    .lean()
    .exec();

  if (!foundUser) return res.status(400).json({ message: "User not found" });

  const postTotal = await Post.countDocuments({ user: foundUser._id })
    .lean()
    .exec();

  res.json({ ...foundUser, postTotal });
};

const followOrUnfollowUser = async (req, res) => {
  const { id: targetId } = req.params;

  const isValidObjectId = mongoose.isObjectIdOrHexString(targetId);
  if (!isValidObjectId)
    return res.status(400).json({ message: "User not found" });

  const userId = req.user._id.toString();

  if (targetId === userId)
    return res
      .status(400)
      .json({ message: "You can't follow your own account" });

  const user = await User.findById(userId).exec();
  const targetedUser = await User.findById(targetId).exec();

  if (!targetedUser || !user)
    return res.status(400).json({ message: "User not found" });

  const isAlreadyFollowing = user.following.includes(targetId);

  if (isAlreadyFollowing) {
    // Unfollow
    const userIdIndex = targetedUser.followers.indexOf(userId);
    const targetIdIndex = user.following.indexOf(targetId);

    user.following.splice(targetIdIndex, 1);
    targetedUser.followers.splice(userIdIndex, 1);

    await user.save();
    await targetedUser.save();
    return res.json({ message: "Unfollowed" });
  } else {
    // Follow
    user.following.push(targetId);
    targetedUser.followers.push(userId);

    const newNotification = new Notification({
      type: "follow",
      from: userId,
      to: targetId,
      ref: targetedUser.username,
    });

    await newNotification.save();
    await user.save();
    await targetedUser.save();
    return res.json({ message: "Followed" });
  }
};

const getSuggestedUser = async (req, res) => {
  const userId = req.user._id;

  const followedUsers = req.user.following;
  const idsToExclude = [userId, ...followedUsers];

  const users = await User.aggregate([
    {
      $match: {
        _id: { $nin: idsToExclude },
      },
    },
    { $sample: { size: 10 } },
    { $project: { password: 0 } },
  ]);

  const suggestedUsers = users.slice(0, 4);

  res.status(200).json(suggestedUsers);
};

const updateUser = async (req, res) => {
  const userId = req.user._id;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const user = await User.findById(userId).exec();

  const { username, currentPassword, newPassword, fullName, email, bio, link } =
    req.body;
  let { coverImg, profileImg } = req.body;

  if (currentPassword) {
    const matchPwd = await bcrypt.compare(currentPassword, user.password);
    if (!matchPwd) return res.status(400).json({ message: "Invalid password" });
  } else if (!coverImg && !profileImg && !currentPassword) {
    return res.status(400).json({ message: "current password are required" });
  }

  if (username && username !== user.username) {
    const duplicate = await User.findOne({ username })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate)
      return res.status(409).json({ message: "Username already taken" });

    user.username = username;
  }

  if (email && email !== user.email) {
    const duplicate = await User.findOne({ email })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate)
      return res.status(409).json({ message: "Email already taken" });
    const emailFormat = emailRegex.test(email);
    if (!emailFormat) {
      return res.status(400).json({ message: "Incorrect email format" });
    }
    user.email = email;
  }

  if (newPassword) {
    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "new Password must be at least 6 characters long" });
    user.password = await bcrypt.hash(newPassword, 10);
  }

  if (profileImg) {
    if (user.profileImg) {
      // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
      // getting the id of img (zmxorcxexpdbh8r0bkjb)
      const imgId = user.profileImg.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    const uploadResult = await cloudinary.uploader.upload(profileImg);
    profileImg = uploadResult.secure_url;
  }

  if (coverImg) {
    if (user.coverImg) {
      await cloudinary.uploader.destroy(
        user.coverImg.split("/").pop().split(".")[0]
      );
    }
    const uploadResult = await cloudinary.uploader.upload(coverImg);
    coverImg = uploadResult.secure_url;
  }

  user.fullName = fullName || user.fullName;
  user.bio = bio || user.bio;
  user.link = link || user.link;
  user.profileImg = profileImg || user.profileImg;
  user.coverImg = coverImg || user.coverImg;

  await user.save();

  user.password = null;

  return res.json(user);
};

const getUserFollowing = async (req, res) => {
  const { username } = req.params;

  const user =
    username === req.user.username
      ? req.user
      : await User.findOne({ username }).lean().exec();
  if (!user) return res.status(404).json({ message: "User not found" });

  const followingIds = user.following;

  const userFollowing = await User.find(
    { _id: followingIds },
    "username fullName profileImg"
  )
    .lean()
    .exec();

  res.json(userFollowing);
};

const getUserFollowers = async (req, res) => {
  const { username } = req.params;

  const user =
    username === req.user.username
      ? req.user
      : await User.findOne({ username }).lean().exec();
  if (!user) return res.status(404).json({ message: "User not found" });

  const followersIds = user.followers;

  const userFollowers = await User.find(
    { _id: followersIds },
    "username fullName profileImg"
  )
    .lean()
    .exec();

  res.json(userFollowers);
};

module.exports = {
  getUserProfile,
  followOrUnfollowUser,
  getSuggestedUser,
  updateUser,
  getUserFollowing,
  getUserFollowers,
};
