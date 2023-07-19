const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    file : {type: mongoose.Schema.Types.ObjectId, ref: 'Tugas'},
    textAnswer :{type : String , required: false},
    fileAnswer : {type: String, required : false}
},{ timestamps: true })

module.exports = mongoose.model('PengumpulanTugas', pengumpulanTugasSchema)
