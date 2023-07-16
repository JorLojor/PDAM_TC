const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    name : {type: String, required: true},
    email : {type: String, required: true},
    username : {type: String, required: true},
    password : {type: String, required: true},
    role : {type: Number, required: true, default : 3}, // 1 = admin, 2 = instruktur, 3 = user
    UserType : {type: Number, required: true, default : 0},// 1 = internal pdam dan 0 = eksternal pdam atau All
    kelas : [{type: mongoose.Schema.Types.ObjectId, ref: 'Kelas'}], //refrensi ke schema kelas
    spesialis: {type: String},// spesialis, req false
    nilai: [{type: mongoose.Schema.Types.ObjectId, required: false, ref: 'nilai'}],// nilai ref nilai
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);

// Path: models/user.js
