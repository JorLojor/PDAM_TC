const moongose = require('mongoose');
const user = require('./user');
const {Schema} = moongose;

const materi = require('./materi');
const peserta = require('./pesertaKelas');
const instruktur  = require('./instruktur');


const kelasSchema = new Schema({
    kodeKelas: {type: String, required: true, unique: true},
    nama : {type: String, required: true},
    harga : {type: Number, required: false},
    kapasitasPeserta : {type: Number, required: true},
    deskription : {type: String, required: true},
    methods : {type: String, required: true}, //online,offline, onlineMeeting
    materi : {type: Schema.Types.ObjectId, ref: 'materi', required: false}, //refrensi ke schema materi
    peserta : [peserta], //refrensi ke schema user dengan role 3 atau peserta hanya untuk 
    instruktur : [instruktur], //refrensi ke schema user dengan role 2 atau instruktur
    kodeNotaDinas: {type: String, required: false}, //refrensi ke schema
<<<<<<< HEAD
    kelasType : {type: String, required: false}, // internal pdam atau eksternal pdam atau All
},{timestamps: true});
=======
    classType : {type: String, required: false},
    classPermission : {type: String, required: false}
});
>>>>>>> 4a35976 (latest/feat : fixing models)

module.exports = moongose.model('Kelas', kelasSchema);
   
