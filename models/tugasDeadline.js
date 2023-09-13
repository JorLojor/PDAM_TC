const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskDeadline = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Tugas" },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Kelas" },
    deadline: {
      type: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskDeadline", taskDeadline);
