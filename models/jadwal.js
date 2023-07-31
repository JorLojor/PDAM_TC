const mongoose = require('mongoose');
const {Schema} = mongoose;

const kelas = require('./kelas');

// pekhususan untuk kelas ofline livestraming
const jadwalSchema = new Schema({
    jamMulai: { type: String, required: true },
    jamSelesai: { type: String, required: true },
    tanggal: [{ type: String, required: true }],
    tipe: { type: String, required: true } // online, offline
},{timestamps : true,_id: false});


module.exports = jadwalSchema
// yang bisa ngisi instruktur doang
