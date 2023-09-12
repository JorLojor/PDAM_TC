const mongoose = require("mongoose");
const { Schema } = mongoose;
const pengumpulanTugasSchema = require("./pengumpulanTugas");

const tugasSchema = new Schema(
  {
    materi: { type: mongoose.Schema.Types.ObjectId, ref: "Materi" },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    deadline: { type: Date, required: false },
    timeLimit: { type: Number, required: true },
    attachment: { type: String, required: false }, //file tugas (soal jadi attecment untuk memperlengkap soal)
    pengumpulanTugas: { type: [pengumpulanTugasSchema], required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tugas", tugasSchema);

// compare this snippet from controllers/tugas.js:
