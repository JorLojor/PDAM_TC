const mongoose = require("mongoose");
const { Schema } = mongoose;

const testSchema = new Schema({
    judul: {
        type: 'string',
        required: [true, 'judul diperlukan untuk test ini']
    },
    type: {
        type: 'string',
        enum: ['pre', 'post', 'quiz'],
        required: [true, 'tipe test diperlukan']
    },
    pembuat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    question: [{
        kode: {
            type: 'string',
            required: [true, 'kode soal diperlukan']
        },
        value: {
            type: 'string',
            required: [true, 'pertanyaan diperlukan']
        },
        img: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            enum: ['essay', 'pg'],
            required: ['true', 'tipe soal diperlukan']
        },
        answer: [{
            value: {
                type: String,
                img: String,
                isTrue: Boolean
            }
        }]
    }]
}, { timestamps: true })

const Test = mongoose.model("Test", testSchema)

module.exports = Test