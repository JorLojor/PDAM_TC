const mongoose = require('mongoose');
const {Schema} = mongoose;

const kelas = require('./kelas');

// pekhususan untuk kelas ofline livestraming
const jadwalSchema = new Schema({
    kelas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Kelas', required: true }],
    jamMulai: { type: Date, required: true },
    jamSelesai: { type: Date, required: true },
    tanggal: { type: Date, required: false }
}, { timestamps: true});


module.exports = mongoose.model('Jadwal',jadwalSchema) 
// yang bisa ngisi instruktur doang
