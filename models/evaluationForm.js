const mongoose = require("mongoose");
const { Schema } = mongoose;

const evaluationForm = new Schema(
  {
    name: {
      type: String,
      index: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EvaluationForm", evaluationForm);

// Path: models/chat.js
// Compare this snippet from controllers/chat.js:
