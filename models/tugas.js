const mongoose = require('mongoose');
const {Schema} = mongoose;
const pengumpulanTugasSchema = require('./pengumpulanTugas');

const tugasSchema =  new Schema({
    description : {type: String, required : true},
    dateStarted : {type: Date,required: true},
    dateFinished: {type: Date,required: true},
    tugasText : {type: String, required : true},//tugas text (soal) 
    tugasFile : {type: String,required: false, default : '/kosong'},//file tugas (soal jadi attecment untuk memperlengkap soal)
    pengumpulanTugas : {type:[pengumpulanTugasSchema], required: false},
    tugasStatus : {type: String,required: false, default : 'not submitted'},//submitted, not submitted, grading, late 
},{ timestamps: true })

module.exports = mongoose.model('Tugas', tugasSchema)

// compare this snippet from controllers/tugas.js:
