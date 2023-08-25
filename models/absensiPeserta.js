const mongoose = require('mongoose');
const { Schema } = mongoose;

const absenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    kelas: {
        type: Schema.Types.ObjectId,
        ref: "Kelas",
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),
        required: true
    },
    absenName: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Absensi', absenSchema);