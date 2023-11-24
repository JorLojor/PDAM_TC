const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentationSchema = new Schema({
  file: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("documentation", documentationSchema);

//compare this snippet from models/kelas.js:
