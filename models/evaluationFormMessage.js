const mongoose = require("mongoose");
const { Schema } = mongoose;

const evaluationFormMessage = new Schema(
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
    evaluationForm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationForm",
      index: true,
    },
    evaluationFormQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationFormQuestion",
      index: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EvaluationFormMessage", evaluationFormMessage);

// Path: models/chat.js
// Compare this snippet from controllers/chat.js:
