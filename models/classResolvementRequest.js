const mongoose = require("mongoose");
const { Schema } = mongoose;

const classResolvementRequest = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    kelas: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ClassResolvementRequest",
  classResolvementRequest
);
