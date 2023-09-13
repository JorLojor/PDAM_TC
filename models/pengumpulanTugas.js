const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    kelas:{type:String,required:false},
    answer : {type : String, required: false}, // by text
    answerFile : {type : String, required: false}, // by file
    nilai : {type: Number, required : false},
    dateSubmitted : {type: Date, required: true, default : new Date()},
    status : {type: String, required : false,default:'menunggu'}//menunggu penilaian, telat mengumpulkan, sudah dinilai
},{ timestamps: true })

module.exports = pengumpulanTugasSchema
