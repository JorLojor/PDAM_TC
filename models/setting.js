const mongoose = require("mongoose");
const { Schema } = mongoose;

const setting = new Schema(
  {
    banner: [
      {
        type: String,
        required: false,
      },
    ],
    about: {
      type: {},
      required: false,
    },
    our_class: {
      type: String,
      required: false,
    },
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: false,
      },
    ],
    youtube_link: {
      type: String,
      required: false,
    },
    video_trailer: {
      type: String,
      required: false,
    },
    testimony: [
      {
        type: {},
        required: false,
      },
    ],
    class_count: {
      type: Number,
      required: false,
    },
    instructor_count: {
      type: Number,
      required: false,
    },
    participant_count: {
      type: Number,
      required: false,
    },
    kelas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Kelas",
        index: true,
        required: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", setting);

// Path: models/setting.js
// Compare this snippet from controllers/setting.js:
