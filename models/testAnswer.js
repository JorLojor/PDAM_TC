import mongoose from 'mongoose';
const { Schema } = mongoose;

const answerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'user id diperlukan']
    },
    answers: [{
        kodeSoal: {
            type: Schema.Types.Mixed,
            required: [true, 'Kode soal diperlukan']
        },
        value: String
    }],
    nilai: Number
})

const TestAnswer = mongoose.model("TestAnswer", answerSchema)

export default TestAnswer