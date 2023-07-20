const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    answer : {type : String, required: true},
    nilai : {type: Number, required : false}
},{ timestamps: true })

module.exports = pengumpulanTugasSchema
