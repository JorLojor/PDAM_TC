const mongoose = require('mongoose');
const {Schema} = mongoose;

const pesertaKelasSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: String, required: false, default:'pending'}, // pending, accepted, rejected
},{ timestamps: true, _id:false })

module.exports = pesertaKelasSchema;
