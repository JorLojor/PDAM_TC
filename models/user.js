const mongoose = require("mongoose");
const kelasInUserSchema = require("./kelasInUser");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    instansi: { type: String, required: false },
    bio: { type: String, required: false },
    pendidikan: [{ type: String, required: false, default: [] }],
    kompetensi: [{ type: String, required: false, default: [] }],
    bidang: [{ type: String, required: false, default: [] }],
    nipp: { type: String, required: false },
    userImage: { type: String, required: false },
    role: { type: Number, required: true, default: 3 }, // penentuan user 1 = admin, 2 = instruktur, 3 = student, 0 = super admin
    userType: { type: Number, required: true, default: 0 }, // 1 = internal pdam dan 0 = eksternal pdam atau All
    kelas: [{ type: kelasInUserSchema, required: false }],
    phone: { type: String, required: false },
    link_cv: { type: String, required: false },
    spesialis: { type: String }, // spesialis, req false
    nilai: [
      { type: mongoose.Schema.Types.ObjectId, required: false, ref: "nilai" },
    ], // nilai ref nilai,
    jabatan: { type: String, required: false },
    rating: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "rating",
        default: [],
      },
    ], // rating ref rating,
    status: { type: String, required: true, default: "pending" }, // status registrasi -> pending,declined,accepted
    access_token: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
