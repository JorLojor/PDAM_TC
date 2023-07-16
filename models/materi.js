const mongoose = require('mongoose');
const {Schema} = mongoose;

const materiSchema = new Schema({
    kodeMateri: {type: String, required: true},
    nama : {type: String, required: true},
    description : {type: String, required: true},
    type : {type: String, required: true}, //file / video
    source: {type: String, required: true}, // yputube gdrive
    tugas : {type: Schema.Types.ObjectId, ref: 'materi'}
})

module.exports = mongoose.model('Materi', materiSchema);

// Path: models/materi.js
