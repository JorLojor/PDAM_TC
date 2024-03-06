const mongoose = require("mongoose");
const { Schema } = mongoose;

const kelasBesarSchema = new Schema(
  {
    title: { type: String, required: true },
    picture: { type: String, required: true },
    status: { type: Number, required: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model("kelasBesar", kelasBesarSchema);