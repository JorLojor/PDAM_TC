const mongoose = require("mongoose");
const { Schema } = mongoose;

const complaint = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaint);

// Path: models/complaint.js
// Compare this snippet from controllers/complaint.js:
