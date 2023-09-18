const mongoose = require("mongoose");
const { Schema } = mongoose;

const organizationStructure = new Schema(
  {
    picture: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrganizationStructure", organizationStructure);
