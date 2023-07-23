const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    file : {type: String, required : false, default : '/kosong'},
    answer : {type : String, required: true},
    nilai : {type: Number, required : false, default : 0}
},{ timestamps: true })

module.exports = pengumpulanTugasSchema
