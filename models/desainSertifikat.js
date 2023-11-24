const mongoose = require("mongoose");
const { Schema } = mongoose;

const desainSertifikat = new Schema(
  {
    peserta: { type: mongoose.Schema.Types.ObjectId, ref: "Sertifikat" },
    instruktur: { type: mongoose.Schema.Types.ObjectId, ref: "Sertifikat" },
  },
  { timestamps: true }
);

module.exports = desainSertifikat;
