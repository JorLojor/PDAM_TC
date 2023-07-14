const mongoose = require('mongoose');
const {Schema} = mongoose;

const instruktur = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    nama: {type: String, required: true},
    email: {type: String, required: true},
    nohp: {type: Number, required: true},
    spesialis: {type: String, required: true},
},{timestamps: true,_id:false});

module.exports = instruktur;

// Path: models/instruktur.js
// Compare this snippet from controllers/kelas.js:
