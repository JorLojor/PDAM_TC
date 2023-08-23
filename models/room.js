const mongoose = require("mongoose");
const { Schema } = mongoose;

const room = new Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      index: true,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", room);

// Path: models/room.js
// Compare this snippet from controllers/room.js:
