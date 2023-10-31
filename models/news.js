const mongoose = require("mongoose");
const { Schema } = mongoose;

const news = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    content: {
      type: {},
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", news);
