const Test = require('../models/test')
const response = require("../respons/response");
const MateriModel = require("../models/materi");
const testAnswer = require("../models/testAnswer");
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function calculateGrade(answerArray, maxGrade) {
    const booleanAnswers = answerArray.filter((element) => typeof element === 'boolean');
    const correctCount = booleanAnswers.reduce((acc, currentValue) => {
        if (currentValue === true) {
            return acc + 1;
        }
        return acc;
    }, 0);

    const percentageCorrect = (correctCount / booleanAnswers.length) * 100;
    const grade = (percentageCorrect / 100) * maxGrade;

    return Math.ceil(grade);
}

module.exports = {
    store: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            let { data } = req.body;
            const { slug, title } = req.params;
            // data = data.replaceAll("'", '"') 
            let imageTest = '/uploads/test-image/'
            const dataPertanyaan = JSON.parse(data)
            const materi = await MateriModel.findOne({ slug })

            if (req.files) {
                imageTest = req.files[0].path.split("/PDAM_TC/")[1];
            }
            const questions = dataPertanyaan.questions.map((data) => {
                let path = null
                if (data.img != null) {
                    path = imageTest + data.img.name
                }
                let answer = data.answer.map((answer) => {
                    let pathAnswer = null
                    if (answer.img != null) {
                        pathAnswer = imageTest + answer.img.name
                    }
                    return {
                        value: answer.value,
                        isTrue: answer.isTrue,
                        img: pathAnswer
                    }
                })
                return {
                    value: data.value,
                    type: data.type,
                    img: path,
                    kode: makeid(8),
                    answer
                }
            })
            const post = {
                judul: dataPertanyaan.judul,
                type: dataPertanyaan.type,
                pembuat: dataPertanyaan.pembuat,
                question: questions
            }
            const tests = new Test(post)
            tests.save({ session })
            if (dataPertanyaan.type == "pre") {
                await MateriModel.updateOne({ slug: slug }, { $set: { 'test.pre': tests._id } }, { upsert: true, new: true, session });
            } else if (dataPertanyaan.type == "post") {
                await MateriModel.updateOne({ slug: slug }, { $set: { 'test.post': tests._id } }, { upsert: true, new: true, session });
            }
            if (title != "null" && dataPertanyaan.type == "quiz") {
                await MateriModel.updateOne({ slug: slug, 'items.title': title }, { $set: { 'items.$.quiz': tests._id } }, { upsert: true, new: true, session });
            }
            materi.save({ session })

            await session.commitTransaction();
            session.endSession();
            return response(200, {}, "Test Berhasil di masukan", res);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            return response(500, error, error.message, res);
        } finally {
            session.endSession();
        }
    },
    getTest: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await TestModel.findById(id).populate('pembuat');

            if (!result) {
                response(404, id, "Test tidak di temukan", res);
            }

            response(200, result, "Test di dapat", res);
        } catch (error) {
            response(500, error, "Server error", res);
        }
    },
    nilai: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { id } = req.params;
            let { data } = req.body;
            // data = data.replaceAll("'", '"') cuma buat test
            const dataJawaban = JSON.parse(data)
            let jawaban = dataJawaban.answer.map((answer) => {
                return answer.value
            })

            const nilai = calculateGrade(jawaban, 100)
            const post = {
                user: dataJawaban.user_id,
                test: id,
                answer: dataJawaban.answer,
                nilai
            }
            let answer = new testAnswer(post)
            answer.save({ session })

            await session.commitTransaction();
            session.endSession();
            response(200, nilai, "Nilai berhasil dimasukan", res);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            response(500, error, "Server error", res);
        }
    },
    deleteTest: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { id } = req.params;
            const test = await Test.findById(id);
            test.question.forEach(question => {
                if (question.img != null) {
                    fs.unlinkSync(path.join(__dirname, question.img), { recursive: true, force: true })
                }
                question.answer.forEach(answer => {
                    if (answer.img != null) {
                        fs.unlinkSync(path.join(__dirname, answer.img), { recursive: true, force: true })
                    }
                })
            })
            test.deleteOne({ session })

            await session.commitTransaction();
            session.endSession();
            response(200, image, "Nilai berhasil dimasukan", res);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            response(500, error, "Server error", res);
        }
    },
    updateTest: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            let { data } = req.body;
            const { id } = req.params;
            // data = data.replaceAll("'", '"') cuma buat experiment
            let imageTest = '/uploads/test-image/'
            const dataPertanyaan = JSON.parse(data)

            if (req.files) {
                imageTest = req.files[0].path.split("/PDAM_TC/")[1];
            }
            const questions = dataPertanyaan.questions.map((data) => {
                let path = null
                if (data.img != null) {
                    path = imageTest + data.img.name
                }
                let answer = data.answer.map((answer) => {
                    let pathAnswer = null
                    if (answer.img != null) {
                        pathAnswer = imageTest + answer.img.name
                    }
                    return {
                        value: answer.value,
                        isTrue: answer.isTrue,
                        img: pathAnswer
                    }
                })
                return {
                    value: data.value,
                    type: data.type,
                    img: path,
                    kode: makeid(8),
                    answer
                }
            })
            const post = {
                judul: dataPertanyaan.judul,
                type: dataPertanyaan.type,
                pembuat: dataPertanyaan.pembuat,
                question: questions
            }
            await Test.updateOne({ _id: id }, post, { new: true, upsert: true, session })

            await session.commitTransaction();
            session.endSession();
            return response(200, {}, "Test Berhasil di masukan", res);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            response(500, error, "Server error", res);
        }
    }
}