const mongoose = require('mongoose');
const {Schema} = mongoose;

const tugasSchema =  new Schema({
    dateStarted : {type: date,required: false},
    dateFinished: {type: date,required: false},
    description : {type: string,required: true},
    fileTugas : {type: string,required: false},//file tugas
    pengumpulanTugas : [{Type : Schema.Types.ObjectId, ref: 'User'}]
})

module.exports = mongoose.model('Nilai', tugasSchema)