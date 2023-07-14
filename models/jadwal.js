const moongose = require('mongoose');
const {Schema} = moongose;

const kelas = require('./kelas');

// pekhususan untuk kelas ofline livestraming
const jadwalSchema = new Schema({
    kelas:{type: Schema.Types.ObjectId, ref: 'kelas', required: false},
    jamMulai:{type: Date, required: false},
    jamSelesai:{type: Date, required: false},
    taggal:{type: Date, required: false}
},{ timestamps: true,_id:false });

module.exports = jadwalSchema;

// yang bisa ngisi instruktur doang

// Path: models/jadwal.js
