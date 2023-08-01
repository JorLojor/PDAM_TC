const mongoose = require('mongoose');
const {Schema} = mongoose;
// const pengumpulanTugas = require('./pengumpulanTugas')
const tugasSchema =  new Schema({
    description : {type: String, required : true},
    instruksi: {type: String, required : true},
    dateStarted : {type: Date,required: true},
    dateFinished: {type: Date,required: true},
    slug : {type: String, required: true},
    fileTugas : {type: String,required: false, default : '/kosong'},//file tugas (soal jadi attecment untuk memperlengkap soal)
    pengumpulanTugas : {type: mongoose.Schema.Types.ObjectId, ref: 'PengumpulanTugas', required: false}
},{ timestamps: true })

module.exports = mongoose.model('Tugas', tugasSchema)

// compare this snippet from controllers/tugas.js:
