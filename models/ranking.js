const mongoose = require("mongoose");
const { Schema } = mongoose;

const rankingSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    kelas: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
    },
    ranking: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Ranking = mongoose.model("Ranking", rankingSchema);

module.exports = Ranking;
