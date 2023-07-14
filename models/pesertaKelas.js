const mongoose = require('mongoose');
const {Schema} = mongoose;

const pesertaKelasSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    status: {type: String, required: true}, // pending, accepted, rejected
})
const pesertaKelas = mongoose.model('pesertaKelas',pesertaKelasSchema)


module.exports = pesertaKelasSchema;

// Path: models/pesertaKelas.js
