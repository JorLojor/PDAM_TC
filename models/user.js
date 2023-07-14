const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    name : {type: String, required: true},
    email : {type: String, required: true},
    username : {type: String, required: true},
    password : {type: String, required: true},
    role : {type: Number, required: false}, // 1 = admin, 2 = instruktur, 3 = user
    UserType : {type: String, required: false}, // internal pdam atau eksternal pdam
    kelas : [{type: Schema.Types.ObjectId, ref: 'Kelas', required: false}], //refrensi ke schema kelas
    spesialis: {type: String, required: false},// spesialis, req false
    jabatan: {type: String, required: false},// jabatan, req false
    nilai: {type: Schema.Types.ObjectId, required: false, ref: 'Nilai'},// nilai ref nilai
},{timestamps: true});  

module.exports = mongoose.model('User', userSchema);

// Path: models/user.js
