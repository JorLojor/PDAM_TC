const mongoose = require('mongoose');
const {Schema} = mongoose;

const materiSchema = new Schema({
    kodeMateri: {type: String, required: true},
    nama : {type: String, required: true},
    description : {type: String, required: true},
    type : {type: String, required: true}, //file / video
    source: {type: String, required: true}, // yputube gdrive
    tugas : {type: mongoose.Schema.Types.ObjectId, ref: 'tugas'},
    nilaiPermateri: {type: Number, required: false, default: 0}
},{ timestamps: true });

module.exports = mongoose.model('Materi', materiSchema);

// Path: models/materi.js
