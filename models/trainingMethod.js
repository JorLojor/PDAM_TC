const mongoose = require("mongoose");
const { Schema } = mongoose;

const trainingMethodSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingMethod", trainingMethodSchema);
