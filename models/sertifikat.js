const mongoose = require('mongoose');
const positionSertifikatSchema = require('./positionSertifikat');
const {Schema} = mongoose;

const sertifikatSchema =  new Schema({
    nama : {type : String, required:true},
    desain : {type: String, required : true},
    namePosition:{type: positionSertifikatSchema},
    kelasPosition:{type: positionSertifikatSchema},
    fotoPosition:{type: positionSertifikatSchema},
},{ timestamps: true })

module.exports = mongoose.model('Sertifikat', sertifikatSchema)

