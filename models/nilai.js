const mongoose = require('mongoose');
const {Schema} = mongoose;

const nilaiSchema =  new Schema({
    kelas: {type: Schema.Types.ObjectId, ref: 'Kelas'}, 
    nilai: {type: Number, required: true, default: 0}
})

module.exports = mongoose.model('Nilai', nilaiSchema)

// Path: models/nilai.js
