const mongoose = require("mongoose");
const { Schema } = mongoose;

const evaluationFormResult = new Schema(
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
    sapras: {
      type: Number,
      index: true,
      default: 0,
    },
    instruktur: {
      type: Number,
      index: true,
      default: 0,
    },
    materi: {
      type: Number,
      index: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EvaluationFormResult", evaluationFormResult);

// Path: models/chat.js
// Compare this snippet from controllers/chat.js:
