const moongose = require('mongoose');
const {Schema} = moongose;

const materi = require('./materi');
// const peserta = require('./peserta');


const kelasSchema = new Schema({
    kodeKelas: {type: String, required: true, unique: true},
    nama : {type: String, required: true},
    harga : {type: Number, required: false},
    kapasitasPeserta : {type: Number, required: true},
    description : {type: String, required: true},
    methods : {type: String, required: true}, //online,offline, onlineMeeting
    materi : {type: Schema.Types.ObjectId, ref: 'materi', required: false}, //refrensi ke schema materi
    peserta : {type: Schema.Types.ObjectId, ref: 'peserta', required: false}, //refrensi ke schema user dengan role 3 atau peserta hanya untuk 
    instruktur : {type: Schema.Types.ObjectId, ref: 'instruktur', required: false}, //refrensi ke schema user dengan role 2 atau instruktur
    kodeNotaDinas: {type: String, required: false}, //refrensi ke schema
});

module.exports = moongose.model('Kelas', kelasSchema);
   

// Path: models/kelas.js
