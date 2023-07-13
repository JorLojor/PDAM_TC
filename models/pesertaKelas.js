const mongoose = require('mongoose');
const {Schema} = mongoose;

const pesertaKelasSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    status: {type: String, required: true}, // pending, accepted, rejected
})

module.exports = pesertaKelasSchema;

// Path: models/pesertaKelas.js
