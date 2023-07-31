const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    name : {type: String, required: true},
    email : {type: String, required: true},
    username : {type: String, required: true},
    password : {type: String, required: true},
    role : {type: Number, required: true, default : 3}, // penentuan user 1 = admin, 2 = instruktur, 3 = student 
    userType : {type: Number, required: true, default : 0},// 1 = internal pdam dan 0 = eksternal pdam atau All
    userStatus : {type: Number, required: true, default : 0},// 1 = pending 2 = declined 3 = registered
    kelas : [{type: mongoose.Schema.Types.ObjectId, ref: 'Kelas'}], //refrensi ke schema kelas
    spesialis: {type: String},// spesialis, req false
    nilai: [{type: mongoose.Schema.Types.ObjectId, required: false, ref: 'nilai'}],// nilai ref nilai
    status : {type : String, required : true, default : 'pending'}// status registrasi -> pending,declined,accepted
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
