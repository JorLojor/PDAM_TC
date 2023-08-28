const mongoose = require("mongoose");
const { Schema } = mongoose;

const recentClass = new Schema(
  {
    kelas: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    number: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecentClass", recentClass);

// Path: models/chat.js
// Compare this snippet from controllers/chat.js:
