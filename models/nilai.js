const mongoose = require('mongoose');
const {Schema} = mongoose;

const nilaiSchema =  new Schema({
    kelas: {type: mongoose.Schema.Types.ObjectId, ref: 'Kelas'}, 
    nilai: {type: Number, required: true, default: 0}
},{ timestamps: true })

module.exports = mongoose.model('Nilai', nilaiSchema)

// Path: models/nilai.js
