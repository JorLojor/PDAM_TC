const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    answer : {type : String, required: true}, // by text
    answerFile : {type : String, required: false, default: '/kosong'}, // by file
    nilai : {type: Number, required : false},
    dateSubmitted : {type: Date, required: true, default : new Date()},
},{ timestamps: true })

module.exports = pengumpulanTugasSchema
