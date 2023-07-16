const mongoose = require('mongoose');
const {Schema} = mongoose;

const tugasSchema =  new Schema({
    description : {type: String, required : true},
    dateStarted : {type: Date,required: false},
    dateFinished: {type: Date,required: false},
    fileTugas : {type: String,required: false},//file tugas
    // pengumpulanTugas : [{Type : mongoose.Schema.Types.ObjectId, ref: 'Materi'}]
},{ timestamps: true })

module.exports = mongoose.model('Nilai', tugasSchema)

// compare this snippet from controllers/tugas.js:
