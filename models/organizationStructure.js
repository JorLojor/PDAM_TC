const mongoose = require("mongoose");
const { Schema } = mongoose;

const organizationStructure = new Schema(
  {
    picture: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    position: {
      type: String,
      required: false,
    },
    star: {
      type: Number,
      required: false,
    },
    class: {
      type: Number,
      required: false,
    },
    student: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrganizationStructure", organizationStructure);
