const mongoose = require("mongoose");
const { Schema } = mongoose;

const classEnrollmentLog = new Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassEnrollmentLog", classEnrollmentLog);
