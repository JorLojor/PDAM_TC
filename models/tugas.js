const mongoose = require('mongoose');
const {Schema} = mongoose;

const tugasSchema =  new Schema({
    description : {type: string, required : true},
    dateStarted : {type: date,required: false},
    dateFinished: {type: date,required: false},
    description : {type: string,required: true},
    fileTugas : {type: string,required: false},//file tugas
    pengumpulanTugas : [{Type : mongoose.Schema.Types.ObjectId, ref: 'User'}]
},{ timestamps: true })

module.exports = mongoose.model('Nilai', tugasSchema)