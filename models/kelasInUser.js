const mongoose = require('mongoose');
const {Schema} = mongoose;

const kelasInUserSchema = new Schema({
    kelas: {type: mongoose.Schema.Types.ObjectId, ref: 'Kelas'},
    status: {type: String, required: false, default:'pending'}, // pending, accepted, rejected
    last_accessed:{type:Date,required:false}
},{ timestamps: true })

module.exports = kelasInUserSchema;
