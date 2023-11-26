const mongoose = require("mongoose");
const { Schema } = mongoose;

const answerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id diperlukan"],
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: [true, "test id diperlukan"],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
      required: [true, "kelas id diperlukan"],
    },
    answers: [
      {
        kodeSoal: {
          type: String,
          required: [true, "Kode soal diperlukan"],
        },
        value: Schema.Types.Mixed,
      },
    ],
    nilai: { type: Number, default: 0 },
    startAt: { type: Date, required: true },
    finishAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const TestAnswer = mongoose.model("TestAnswer", answerSchema);

module.exports = TestAnswer;
