const moongose = require('mongoose');
const {Schema} = moongose;

const kelas = require('./kelas');

// pekhususan untuk kelas ofline livestraming
const jadwalSchema = new Schema({
    kelas:{type: Schema.Types.ObjectId, ref: 'kelas', required: true},
    jamMulai:{type: Date, required: false},
    jamSelesai:{type: Date, required: false},
    taggal:{type: Date, required: false}
},{timestamps: true});

module.exports = jadwalSchema;

// yang bisa ngisi instruktur doang
