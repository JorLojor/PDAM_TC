const mongoose = require('mongoose');
const {Schema} = mongoose;

const pengumpulanTugasSchema =  new Schema({
    user : {type: Schema.Types.ObjectId, ref: 'User'},
    file : {type: Schema.Types.ObjectId, ref: 'Tugas'},
    textAnswer :{type : String , required: false},
    fileAnswer : {type: String, required : false}
})

module.exports = mongoose.model('Nilai', pengumpulanTugasSchema)