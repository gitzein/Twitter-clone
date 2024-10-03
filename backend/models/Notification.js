const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "like", "comment", "likeComment", "retweet"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    ref: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
