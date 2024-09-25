const Notification = require("../models/Notification");

const getAllNotification = async (req, res) => {
  const userId = req.user._id;

  const allNotification = await Notification.find({ to: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "from", select: "username profileImg" })
    .lean()
    .exec();

  await Notification.updateMany({ to: userId }, { read: true });
  res.json(allNotification);
};

const getUnreadNotification = async (req, res) => {
  const userId = req.user._id;

  const unreadNotif = await Notification.find({ to: userId, read: false })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  res.json(unreadNotif);
};

const deleteNotification = async (req, res) => {
  const userId = req.user._id;

  await Notification.deleteMany({ to: userId });

  res.json({ message: "Notification deleted successfully" });
};

module.exports = {
  getAllNotification,
  getUnreadNotification,
  deleteNotification,
};
