const mongoose = require('mongoose');
const {Schema} = mongoose;

const nilaiSchema =  new Schema({
    kelas: {type: 'string', required: false}, 
    nilai: {type: 'Number', required: true, default: 0}
},{timestamps: true})

module.exports = mongoose.model('Nilai', nilaiSchema)

// Path: models/nilai.js
