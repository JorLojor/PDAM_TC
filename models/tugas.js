const mongoose = require('mongoose');
const {Schema} = mongoose;
const pengumpulanTugasSchema = require('./pengumpulanTugas');

const tugasSchema =  new Schema({
    description : {type: String, required : true},
    dateStarted : {type: Date,required: true},
    dateFinished: {type: Date,required: true},
    fileText : {type: String, required : true},//file text (soal)
    fileTugas: { type: String, required: false, default: '/kosong' },//file tugas (soal jadi attecment untuk memperlengkap soal)
    pengumpulanTugas : {type:[pengumpulanTugasSchema], required: false}, // udh ada nilainaya di dalam sini
    materi: {type: mongoose.Schema.Types.ObjectId, ref: 'Materi',required: true} // refrensi ke materi yang mana tugas ini berada
},{ timestamps: true })

module.exports = mongoose.model('Tugas', tugasSchema)

// compare this snippet from controllers/tugas.js:
