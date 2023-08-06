const { Schema } = require("mongoose");

const positionSertifikatSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    weight: { type: Number, required: true },
    size: { type: Number, required: true },
    color: { type: String, required: true },
  },
  { timestamps: false,_id:false }
);

module.exports = positionSertifikatSchema;
