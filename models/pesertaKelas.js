const mongoose = require('mongoose');
const {Schema} = mongoose;

const pesertaKelasSchema = new Schema({
    kelas: {type: Schema.Types.ObjectId, ref: 'Kelas', required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    status: {type: String, required: true}, // pending, accepted, rejected
},{timestamps: true,_id : false});

module.exports = pesertaKelasSchema;
