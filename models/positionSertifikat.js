const { Schema } = require("mongoose");

const positionSertifikatSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    weight: { type: Number, required: false },
    size: { type: Number, required: false },
    color: { type: String, required: false },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
    radius: { type: Number, required: false },
    fontFamily: { type: String, required: false },
    align: { type: String, required: false },
    width: { type: Number, required: false },
    height: { type: Number, required: false }
  },
  { timestamps: false,_id:false }
);

module.exports = positionSertifikatSchema;
