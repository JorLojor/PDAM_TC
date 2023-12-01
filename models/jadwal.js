const mongoose = require("mongoose");
const { Schema } = mongoose;

const jadwalSchema = new Schema(
  {
    jamMulai: { type: String, required: true },
    jamSelesai: { type: String, required: true },
    tanggal: { type: String, required: true },
    tipe: { type: String, required: true }, // online, offline
  },
  { timestamps: false, _id: false }
);

module.exports = jadwalSchema;
