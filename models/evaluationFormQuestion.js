const mongoose = require("mongoose");
const { Schema } = mongoose;

const evaluationFormQuestion = new Schema(
  {
    name: {
      type: String,
      index: true,
      unique: true,
    },
    evaluationForm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationForm",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "EvaluationFormQuestion",
  evaluationFormQuestion
);

// Path: models/chat.js
// Compare this snippet from controllers/chat.js:
