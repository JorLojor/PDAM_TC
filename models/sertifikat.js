const mongoose = require('mongoose');
const {Schema} = mongoose;

const sertifikatSchema =  new Schema({
    kelas : {type : mongoose.Schema.Types.ObjectId, ref: 'kelas'},
    desain : {type: String, required : true},
},{ timestamps: true })

module.exports = mongoose.model('Sertifikat', sertifikatSchema)

// compare this snippet from controllers/tugas.js:
