const mongoose = require("mongoose");
const { Schema } = mongoose;

const classEnrollment = new Schema(
  {
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    class: [{ type: mongoose.Schema.Types.ObjectId, ref: "Kelas" }],
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassEnrollment", classEnrollment);
