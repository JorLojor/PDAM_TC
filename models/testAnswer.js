const mongoose = require("mongoose");
const { Schema } = mongoose;

const answerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'user id diperlukan']
    },
    test: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Test', 
        required: [true, 'test id diperlukan'] 
    },
    answers: [{
        kodeSoal: {
            type: String,
            required: [true, 'Kode soal diperlukan']
        },
        value: Schema.Types.Mixed
    }],
    nilai: Number
})

const TestAnswer = mongoose.model("TestAnswer", answerSchema)

module.exports = TestAnswer