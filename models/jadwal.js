const moongose = require('mongoose');
const {Schema} = moongose;

const kelas = require('kelas');

// pekhususan untuk kelas ofline livestraming
const jadwalSchema = new Schema({
    kelas:[kelas],
    jamMulai:{type: Date, required: false},
    jamSelesai:{type: Date, required: false},
    taggal:{type: Date, required: false}
});

module.exports = moongose.model('Jadwal', jadwalSchema);

// yang bisa ngisi instruktur doang

// Path: models/jadwal.js
