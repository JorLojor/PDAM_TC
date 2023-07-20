const mongoose = require('mongoose');
const { Schema } = mongoose;

// const peserta = require('./peserta');

const kelasSchema = new Schema({
  kodeKelas: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  harga: { type: Number, required: false },
  kapasitasPeserta: { type: Number, required: true },
//   description: { type: String, required: true }, saya coman
  description: { type: String, required: true },
  methods: { type: String, required: true }, //online,offline, onlineMeeting
  materi: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materi' }], // referensi ke schema materi
  peserta: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // referensi ke schema user dengan role 3 atau peserta hanya untuk
  instruktur: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // referensi ke schema user dengan role 2 atau instruktur
  kodeNotaDinas: { type: String, required: false }, // referensi ke schema
  classPermission: { type: String, required: false },
  kelasType: { type: Number, required: false } // 1 = internal pdam dan 0 = eksternal pdam atau All
});

module.exports = mongoose.model('Kelas', kelasSchema);
