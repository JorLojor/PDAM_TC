const mongoose = require("mongoose");
const { Schema } = mongoose;

const kelasBesarSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: String, required: true },
  },
  { timestamps: false, _id: false }
);

module.exports = kelasBesarSchema;