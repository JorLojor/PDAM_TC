const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatNotification = new Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatNotification", chatNotification);
