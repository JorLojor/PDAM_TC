const mongoose = require('mongoose')
const {Schema} = mongoose;
const itemsMateri = require('./itemsMateri');

const materiSchema = new Schema({
    kodeMateri: {type: String, required: true},
    section : {type: String, required: true},
    description : {type: String, required: true},
    items : {type: [itemsMateri]}
},{ timestamps: true });
    
module.exports = mongoose.model('Materi', materiSchema);

// Path: models/materi.js
