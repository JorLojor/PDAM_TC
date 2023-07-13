const mongoose = require('mongoose');
const {Schema} = mongoose;

const instruktur = new Schema({
    nama: {type: String, required: true},
    email: {type: String, required: true},
    nohp: {type: Number, required: true},
    spesialis: {type: String, required: true},
});

module.exports = instruktur;

// Path: models/instruktur.js
