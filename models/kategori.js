const mongoose = require('mongoose');
const {Schema} = mongoose;

const kategoriSchema =  new Schema({
    sampul : {type: String, required : true},
    icon : {type: String, required : true},
    name : {type: String, required : true},
},{ timestamps: true })

module.exports = mongoose.model('Kategori', kategoriSchema)

// compare this snippet from controllers/tugas.js:
