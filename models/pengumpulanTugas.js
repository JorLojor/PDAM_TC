const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    textAnswer :{type : String , required: false},
    fileAnswer : {type: String, required : false,default:"/kosong"}
},{ timestamps: true , _id :false})

module.exports = pengumpulanTugasSchema
