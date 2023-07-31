const mongoose = require('mongoose');
const {Schema} = mongoose;

const calonPesertaSchema = new Schema({
    kelas : {type: mongoose.Schema.Types.ObjectId, ref: 'kelas'},
    peserta : [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    statusCalonPeserta : {type: Number, required: false, default : 'pending'}, // 0 = pending, 1 = approve, 2 = decline
    keterangan : {type: String, required: false}, // opsional
});

module.exports = mongoose.model('calonPeserta', calonPesertaSchema);

//compare this snippet from models/kelas.js:
