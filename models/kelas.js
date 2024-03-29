const mongoose = require("mongoose");
const { Schema } = mongoose;

const materiSchema = require("./materi");
const pesertaKelasSchema = require("./pesertaKelas");
const jadwalSchema = require("./jadwal");
const desainSertifikatSchema = require("./desainSertifikat");

const kelasSchema = new Schema(
  {
    kodeKelas: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    harga: { type: Number, required: false },
    kapasitasPeserta: { type: Number, required: true },
    description: { type: String, required: true },
    methods: {
      type: String,
      enum: ["online", "offline", "onlineMeeting", "hybrid"],
      required: true,
    },
    materi: [{ type: mongoose.Schema.Types.ObjectId, ref: "Materi" }],
    absensi: [
      {
        name: String,
        time: String,
      },
    ],
    biaya: { type: String, required: false },
    tempat: { type: String, required: false },
    lembaga: { type: String, required: false },
    peserta: [{ type: pesertaKelasSchema, required: false }],
    kodeNotaDinas: { type: String, required: false },
    classPermission: { type: String, required: false },
    kelasType: { type: Number, required: false, enum: [0, 1], default: 1 },
    jadwal: [jadwalSchema],
    kategori: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori" },
    trainingMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingMethod",
    },
    kelasStatus: { type: Number, required: true, default: 0 },
    image: { type: String, required: false },
    linkPelatihan: { type: String, required: false },
    isActive: { type: Boolean, required: false, default: true },
    status: {
      type: String,
      required: false,
      default: "pending",
      enum: ["pending", "draft", "publish", "ended", "deleted"],
    },
    linkEvaluasi: { type: String, required: false },
    slug: { type: String, required: true, unique: true },
    desainSertifikat: { type: desainSertifikatSchema, required: false },
    orderRecent: { type: Number, required: false },
    activePostTest: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kelas", kelasSchema);
