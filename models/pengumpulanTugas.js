const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    answer : {type : String, required: true},
    nilai : {type: Number, required : false, default : 0},
    tugasStatus : {type: String,required: false, default : 'not submitted'},//submitted, not submitted, grading, late 
},{ timestamps: true })

module.exports = pengumpulanTugasSchema
