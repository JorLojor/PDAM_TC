const mongoose = require('mongoose');
const user = require('./user');
const {Schema} = mongoose;

const materi = require('./materi');
const peserta = require('./pesertaKelas');
const instruktur  = require('./instruktur');
const nilai = require('./nilai');


const kelasSchema = new Schema({
    kodeKelas: {type: String, required: true, unique: true},
    nama : {type: String, required: true},
    harga : {type: Number, required: false},
    kapasitasPeserta : {type: Number, required: true},
    description : {type: String, required: true},
    methods : {type: String, required: true}, //online,offline, onlineMeeting
    materi : [{type: mongoose.Schema.Types.ObjectId, ref: 'Materi'}], //refrensi ke schema materi
    peserta : [peserta], //refrensi ke schema user dengan role 3 atau peserta hanya untuk 
    instruktur : [instruktur], //refrensi ke schema user dengan role 2 atau instruktur
    kodeNotaDinas: {type: String, required: false}, //refrensi ke schema
    classPermission : {type: String, required: false},
    nilaiperkelas :{type: Number, required: false, default: 0},
    kelasType:{type: Number, required: true} // 1 = internal pdam dan 0 = eksternal pdam atau All 
},{ timestamps: true});

module.exports = mongoose.model('Kelas', kelasSchema);
   
