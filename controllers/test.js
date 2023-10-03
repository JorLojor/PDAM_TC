const Test = require("../models/test");
const response = require("../respons/response");
const MateriModel = require("../models/materi");
const User = require("../models/user");
const Kelas = require("../models/kelas");
const testAnswer = require("../models/testAnswer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const TestAnswer = require("../models/testAnswer");

function makeid(length) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function calculateGrade(answerArray, maxGrade) {
    const booleanAnswers = answerArray.filter(
        (element) => typeof element === "boolean"
    );
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
        try {
            let { data } = req.body;

            const { slug, title } = req.params;
            const daftarGambar = []

            const dataPertanyaan = JSON.parse(data);

            req.files.forEach(file => {
                daftarGambar.push("/upload" + file.path.split("upload")[1].replaceAll("\\", "/"))
            })
           
            const questions = dataPertanyaan.questions.map((data) => {
                let path = null;
                if (data.img != null) {
                    const imgPath = daftarGambar.find(val => val.includes(data.img.name))
                    path = imgPath
                }
                let answer = data.answer.map((answer) => {
                    let pathAnswer = null;
                    if (answer.img != null) {
                        pathAnswer = daftarGambar.find(val => val.includes(answer.img.name))
                    }
                    return {
                        value: answer.value,
                        isTrue: answer.isTrue,
                        img: pathAnswer,
                    };
                });
                return {
                    value: data.value,
                    type: data.type,
                    img: path ? path : null,
                    kode: makeid(8),
                    answer,
                };
            });

            const post = {
                judul: dataPertanyaan.judul,
                type: dataPertanyaan.type,
                pembuat: dataPertanyaan.pembuat,
                question: questions,
            };
            const tests = new Test(post);

            tests.save();

            if (dataPertanyaan.type == "pre") {
                await MateriModel.updateOne(
                    { slug: slug },
                    { $set: { "test.pre": tests._id } },
                    { upsert: true, new: true }
                );
            } else if (dataPertanyaan.type == "post") {
                await MateriModel.updateOne(
                    { slug: slug },
                    { $set: { "test.post": tests._id } },
                    { upsert: true, new: true }
                );
            } else if (dataPertanyaan.type == "quiz") {
                const materi = await MateriModel.updateOne(
                    { slug: slug, "items._id": title },
                    { $set: { "items.$.quiz": tests._id } },
                    { upsert: true, new: true }
                );

                console.log(materi);
            }

            const materi = await MateriModel.findOne({
                slug: slug,
            });

            response(200, materi, "Test Berhasil di masukan", res);
        } catch (error) {
            console.log(error);
            response(500, error, error.message, res);
        }
    },

    getGraphic: async (req, res) => {
        try {
            // const fromDate =
            //   req.query.fromDate && req.query.fromDate !== ""
            //     ? moment(req.query.fromDate)
            //     : null;

            // const toDate =
            //   req.query.toDate && req.query.toDate !== ""
            //     ? moment(req.query.toDate)
            //     : null;

            let months = [];

            let gap = 0;

            for (let i = 0; i < 12; i++) {
                const today = moment();

                const month = today.month();

                const year = today.year();

                let startDate = moment([year, month - i]);

                if (!moment(startDate).isValid()) {
                    startDate = moment([year - 1, 11 - (i - gap)]);
                } else {
                    gap = gap + 1;
                }

                const endDate = moment(startDate).endOf("month");

                let monthName = "";

                switch (moment(startDate).month()) {
                    case 0:
                        monthName = "Januari";
                        break;
                    case 1:
                        monthName = "Februari";
                        break;
                    case 2:
                        monthName = "Maret";
                        break;
                    case 3:
                        monthName = "April";
                        break;
                    case 4:
                        monthName = "Mei";
                        break;
                    case 5:
                        monthName = "Juni";
                        break;
                    case 6:
                        monthName = "Juli";
                        break;
                    case 7:
                        monthName = "Agustus";
                        break;
                    case 8:
                        monthName = "September";
                        break;
                    case 9:
                        monthName = "Oktober";
                        break;
                    case 10:
                        monthName = "November";
                        break;
                    case 11:
                        monthName = "Desember";
                        break;
                }

                months.push({
                    monthName,
                    startDate,
                    endDate,
                });
            }

            let data = [];

            await Promise.all(
                months.map(async (m, i) => {
                    let answers = await testAnswer
                        .find({
                            createdAt: {
                                $gte: m.startDate.toDate(),
                                $lte: m.endDate.toDate(),
                            },
                        })
                        .populate("test", "type");

                    // if (fromDate && toDate) {
                    //   answers = await testAnswer
                    //     .find({
                    //       createdAt: {
                    //         $gte: fromDate.startOf("day").toDate(),
                    //         $lte: toDate.endOf("day").toDate(),
                    //       },
                    //     })
                    //     .populate("test", "type");
                    // }

                    if (answers.length > 0) {
                        let preTotalValue = 0;
                        let postTotalValue = 0;
                        let preType = 0;
                        let postType = 0;

                        let users = 0;
                        let userId = [];

                        answers.map((answer) => {
                            if (answer.test.type == "pre") {
                                preType = preType + 1;
                                preTotalValue = preTotalValue + answer.nilai;

                                if (userId.length == 0) {
                                    userId.push(answer.user);

                                    users = users + 1;
                                } else {
                                    let valid = false;

                                    for (let i = 0; i < userId.length; i++) {
                                        if (answer.user == userId[i]) {
                                            valid = true;
                                        }
                                    }

                                    if (valid) {
                                        userId.push(answer.user);

                                        users = users + 1;
                                    }
                                }
                            } else {
                                postType = postType + 1;
                                postTotalValue = postTotalValue + answer.nilai;

                                if (userId.length == 0) {
                                    userId.push(answer.user);

                                    users = users + 1;
                                } else {
                                    let valid = false;

                                    for (let i = 0; i < userId.length; i++) {
                                        if (answer.user == userId[i]) {
                                            valid = true;
                                        }
                                    }

                                    if (valid) {
                                        userId.push(answer.user);

                                        users = users + 1;
                                    }
                                }
                            }
                        });

                        let nilaiPre =
                            preType > 1 ? preTotalValue / preType : preTotalValue;

                        let nilaiPost =
                            postType > 1 ? postType / postTotalValue : postTotalValue;

                        nilaiPre = nilaiPre / users;
                        nilaiPost = nilaiPost / users;

                        data.push({
                            i,
                            bulan: m.monthName,
                            nilaiPre,
                            nilaiPost,
                        });
                    } else {
                        data.push({
                            i,
                            bulan: m.monthName,
                            nilaiPre: 0,
                            nilaiPost: 0,
                        });
                    }
                })
            );

            data.sort(function (a, b) {
                var keyA = a.i,
                    keyB = b.i;

                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;

                return 0;
            });

            return response(200, data, "Data grafik", res);
        } catch (error) {
            return response(500, error, error.message, res);
        }
    },

    getTest: async (req, res) => {
        try {
            const { id } = req.params;
            const { kelas } = req.query;

            // if (!kelas) {
            //   return response(404, id, "Mohon isi kelas", res);
            // }

            const result = await Test.findById(id).populate("pembuat");

            if (!result) {
                return response(404, id, "Test tidak di temukan", res);
            }

            const checkAnswer = await testAnswer.findOne({
                test: id,
                $and: [
                    {
                        user: req.user.id,
                    },
                    {
                        class: {
                            $in: kelas,
                        },
                    },
                ],
            });

            if (checkAnswer) {
                return response(400, [], "Test sudah dijawab", res);
            }

            return response(200, result, "Test di dapat", res);
        } catch (error) {
            return response(500, error, error.message, res);
        }
    },

    getTestAnswer: async (req, res) => {
        try {
            const data = await testAnswer
                .find({})
                .populate("user")
                .populate("test")
                .populate("class");

            if (!data) {
                return response(400, null, "Data tidak ditemukan", res);
            }

            return response(200, data, "Data ditemukan", res);
        } catch (error) {
            console.log(error);

            return response(500, error, "Server error", res);
        }
    },

    answerTest: async (req, res) => {
        const { user, test, kelas, answers } = req.body;

        try {
            const validUser = await User.findById(user);
            if (!validUser) {
                return response(400, null, "User not found", res);
            }

            const validTest = await Test.findById(test);
            if (!validTest) {
                return response(400, null, "Test not found", res);
            }

            const validKelas = await Kelas.findOne({ slug: kelas });
            if (!validKelas) {
                return response(400, null, "Kelas not found", res);
            }

            const questions = validTest.question;

            let correct = 0;
            let passGrade = 0;

            if (answers.length !== questions.length) {
                return response(
                    400,
                    null,
                    "Number of answers does not match the number of questions",
                    res
                );
            }

            await Promise.all(
                answers.map(async (row, index) => {
                    const question = questions[index].answer;
                    console.log(`User's answer: ${row.answer}`);

                    const checkAnswer = question.find((o) => o.value === row.answer);

                    if (checkAnswer.isTrue) {
                        correct = correct + 1;
                    }

                    passGrade = passGrade + 1;
                })
            );

            const nilai = passGrade === 0 ? 0 : (correct / passGrade) * 100;

            const answer = new testAnswer({
                user,
                test,
                class: validKelas._id,
                answers,
                nilai,
            });

            const save = await answer.save();

            return response(200, save, "Answers have been saved!", res);
        } catch (error) {
            console.error(error);
            return response(500, null, error.message, res);
        }
    },

    getTestAnswerFiltered: async (req, res) => {
        const { type, page, perPage } = req.body;
        try {
            const data = await testAnswer
                .find()
                .populate("user")
                .populate("test")
                .populate("class");

            if (!data) {
                return response(400, null, "Data tidak ditemukan", res);
            }

            const filteredData = data.filter((v) => v.test.type === type);

            // Calculate the starting index for pagination
            const startIndex = (page - 1) * perPage;

            // Use slice to get a portion of the filtered data based on pagination
            const paginatedData = filteredData.slice(
                startIndex,
                startIndex + perPage
            );

            const payload = {
                data: paginatedData,
                totalData: data.length,
            };

            return response(200, payload, "Data ditemukan", res);
        } catch (error) {
            console.log(error);

            return response(500, error, "Server error", res);
        }
    },

    getQuiz: async (req, res) => {
        try {
            const { slug } = req.params;

            let materi = await MateriModel.findOne({ slug })
                .populate("items.quiz", "-question")
                .select("items.quiz items.title");

            materi = await User.populate(materi, {
                path: "items.quiz.pembuat",
                select: "name",
            });

            if (!materi) {
                response(404, id, "Test tidak di temukan", res);
            }

            response(200, materi, "Test di dapat", res);
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
            const dataJawaban = JSON.parse(data);
            let jawaban = dataJawaban.answer.map((answer) => {
                return answer.value;
            });

            const nilai = calculateGrade(jawaban, 100);
            const post = {
                user: dataJawaban.user_id,
                test: id,
                answer: dataJawaban.answer,
                nilai,
            };
            let answer = new testAnswer(post);
            answer.save({ session });

            await session.commitTransaction();
            session.endSession();
            response(200, nilai, "Nilai berhasil dimasukan", res);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            response(500, error, "Server error", res);
        }
    },

    updateQuiz: async (req, res) => {
        const session = await mongoose.startSession();

        try {
            const { id } = req.params;

            const valid = await Test.findById(id);

            if (!valid) {
                return response(400, {}, "Data tidak ditemukan", res);
            }

            session.startTransaction();

            let { data } = req.body;

            let imageTest = "/uploads/test-image/";

            const dataPertanyaan = JSON.parse(data);

            if ((req.files && req.files.length > 0) || req.files != null) {
                imageTest = "/upload/" + req.files[0].path.split("/upload/").pop();
            }

            const questions = dataPertanyaan.questions.map((data) => {
                let path = null;

                if (data.img != null) {
                    path = imageTest;
                }

                let answer = data.answer.map((answer) => {
                    let pathAnswer = null;
                    if (answer.img != null) {
                        pathAnswer = imageTest;
                    }
                    return {
                        value: answer.value,
                        isTrue: answer.isTrue,
                        img: pathAnswer,
                    };
                });

                return {
                    value: data.value,
                    type: data.type,
                    img: path,
                    kode: makeid(8),
                    answer,
                };
            });

            const post = {
                judul: dataPertanyaan.judul,
                type: dataPertanyaan.type,
                pembuat: dataPertanyaan.pembuat,
                question: questions,
            };
            
            Test.findByIdAndUpdate(
                id,
                { post },
                { upsert: true, new: true, session }
            );

            await session.commitTransaction();

            const quiz = await Test.findById(id);

            response(200, quiz, "Quiz Berhasil di perbaharui", res);
        } catch (error) {
            console.log(error);
            response(500, error, error.message, res);
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
    },

    deleteQuiz: async (req, res) => {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const { id } = req.params;

            const { title } = req.query;

            const valid = await Test.findById(id);

            if (!valid) {
                return response(400, {}, "Data tidak ditemukan", res);
            }

            let materi = await MateriModel.findOne({
                items: {
                    $elemMatch: { quiz: id },
                },
            });

            materi = await MateriModel.updateOne(
                { _id: materi._id, "items.title": title },
                { $set: { "items.$.quiz": null } },
                { upsert: true, new: true, session }
            );

            const quiz = await Test.findByIdAndRemove(id);

            await session.commitTransaction();

            response(200, { materi, quiz }, "Quiz Berhasil di hapus", res);
        } catch (error) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }

            console.log(error);

            response(500, error, error.message, res);
        } finally {
            session.endSession();
        }
    },

    deleteTest: async (req, res) => {
        const session = await mongoose.startSession();

        session.startTransaction();

        try {
            const { id, slug, title } = req.params;
            const test = await Test.findOne({ _id: id });
            const dirname = __dirname.replace("\controllers", "");
            
            test.question.forEach((question) => {
                if (question.img != null) {
                    fs.unlinkSync(path.join(dirname, question.img), {
                        recursive: true,
                        force: true,
                    });
                }
                question.answer.forEach((answer) => {
                    console.log(answer)
                    if (answer.img != null) {
                        fs.unlinkSync(path.join(dirname, answer.img), {
                            recursive: true,
                            force: true,
                        });
                    }
                });
            });
            test.deleteOne({ session });

            if (test.type == "pre") {
                await MateriModel.updateOne(
                    { "test.pre": id },
                    { $set: { "test.pre": null } },
                    { upsert: true, new: true, session }
                );
            } else if (test.type == "post") {
                await MateriModel.updateOne(
                    { "test.post": id },
                    { $set: { "test.post": null } },
                    { upsert: true, new: true, session }
                );
            } else if (test.type == "quiz") {
                await MateriModel.updateOne(
                    { slug, "items.title": title },
                    { $set: { "items.$.quiz": null } },
                    { upsert: true, new: true, session }
                );
            }

            await session.commitTransaction();
            response(200, [], "Test Berhasil Dihapus", res);
        } catch (error) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            response(500, error, error.message, res);
        } finally {
            session.endSession();
        }
    },

    updateTest: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let { data } = req.body;
            const { id } = req.params;

            console.log(req.files);

            let imageTest = "/uploads/test-image/";
            const dataPertanyaan = JSON.parse(data);

            if (req.files.length > 0) {
                imageTest = req.files[0].path.split("/PDAM_TC/")[1];
            }
            const questions = dataPertanyaan.questions.map((data) => {
                let path = null;
                if (data.img != null) {
                    path = imageTest + data.img.name;
                }
                let answer = data.answer.map((answer) => {
                    let pathAnswer = null;
                    if (answer.img != null) {
                        pathAnswer = imageTest + answer.img.name;
                    }
                    return {
                        value: answer.value,
                        isTrue: answer.isTrue,
                        img: pathAnswer,
                    };
                });
                return {
                    value: data.value,
                    type: data.type,
                    img: path,
                    kode: makeid(8),
                    answer,
                };
            });
            const post = {
                judul: dataPertanyaan.judul,
                type: dataPertanyaan.type,
                pembuat: dataPertanyaan.pembuat,
                question: questions,
            };
            await Test.updateOne({ _id: id }, post, {
                new: true,
                upsert: true,
                session,
            });

            await session.commitTransaction();
            session.endSession();
            return response(200, {}, "Test Berhasil di masukan", res);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            response(500, error, "Server error", res);
        }
    },

    testCheck: async (req, res) => {
        try {
            let { user, test } = req.body;

            let data = {
                result: false,
            };

            const answer = await TestAnswer.findOne({
                test,
                $and: [
                    {
                        user,
                    },
                ],
            });

            if (answer) {
                data = {
                    result: true,
                };
            }

            return response(200, data, "Pengecekan berhasil", res);
        } catch (error) {
            response(500, error, "Server error", res);
        }
    },
};
