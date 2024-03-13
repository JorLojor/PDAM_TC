const mongoose = require("mongoose");
const { Schema } = mongoose;
const itemsMateriSchema = require("./itemsMateri");

const TestSchema = new Schema({
  pre: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
});

const materiSchema = new Schema(
  {
    kodeMateri: { type: String, required: true },
    test: { type: TestSchema, required: false },
    slug: { type: String, required: true },
    section: { type: String, required: true }, // Judul
    description: { type: String, required: true },
    items: [itemsMateriSchema],
    instruktur: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    test: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Materi", materiSchema);
