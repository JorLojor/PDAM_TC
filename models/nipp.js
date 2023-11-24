const mongoose = require("mongoose");
const { Schema } = mongoose;

const nippSchema = new Schema(
  {
    name: { type: String, required: true },
    nipp: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nipp", nippSchema);
