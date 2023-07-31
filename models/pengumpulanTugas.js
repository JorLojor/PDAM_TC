const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    answer : {type : String, required: true},
    nilai : {type: Number, required : false},
    dateSubmitted : {type: Date, required: true, default : new Date()},
    status : {type: String,required: true, default : "Menunggu penilaian"}// telat mengumpulkan, menunggu penilaian, sudah diniai 
},{ timestamps: true })

module.exports = mongoose.model('PengumpulanTugas',pengumpulanTugasSchema)