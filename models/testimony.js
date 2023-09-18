const mongoose = require("mongoose");
const { Schema } = mongoose;

const testimony = new Schema(
  {
    picture: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    testimony: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimony", testimony);
