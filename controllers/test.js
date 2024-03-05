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
const {
  paginateArray,
  countRanking,
  converttoSecond,
  converttoMinute,
} = require("../service");

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
      const daftarGambar = [];

      const dataPertanyaan = JSON.parse(data);

      req.files.forEach((file) => {
        daftarGambar.push(
          "/upload" + file.path.split("upload")[1].replaceAll("\\", "/")
        );
      });

      const questions = dataPertanyaan.questions.map((data) => {
        let path = null;
        if (data.img != null) {
          const imgPath = daftarGambar.find((val) =>
            val.includes(data.img.name)
          );
          path = imgPath;
        }
        let answer = data.answer.map((answer) => {
          let pathAnswer = null;
          if (answer.img != null) {
            pathAnswer = daftarGambar.find((val) =>
              val.includes(answer.img.name)
            );
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

        // console.log(materi);
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
      // const { kelas } = req.query;

      // if (!kelas) {
      //   return response(404, id, "Mohon isi kelas", res);
      // }

      const result = await Test.findById(id).populate("pembuat");

      if (!result) {
        return response(404, id, "Test tidak di temukan", res);
      }

      // const realKelas = await Kelas.findById(kelas);

      // const today = moment().format("ddd MMM DD YYYY");

      // const last = moment(
      //   realKelas.jadwal[realKelas.jadwal.length - 1].tanggal
      // ).format("ddd MMM DD YYYY");

      // if (moment(today).isAfter(last)) {
      //   return response(400, {}, "Kelas sudah berakhir", res);
      // }

      // checkAnswer = await testAnswer.findOne({
      //   test: id,
      //   $and: [
      //     {
      //       user: req.user.id,
      //     },
      //     {
      //       class: {
      //         $in: kelas,
      //       },
      //     },
      //   ],
      // });

      let checkAnswer = await testAnswer.findOne({
        test: id,
        $and: [
          {
            user: req.user.id,
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

  getStudentClass: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await testAnswer
        .find({
          user: req.user.id,
        })
        .populate("test");

      let data = [];

      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          const kelas = await Kelas.findById(result[i].kelas);

          const test = await Test.findById(result[i].test);

          if (kelas && nama) {
            data.push({
              test: test.judul,
              kelas: kelas.nama,
              nilai: result[i].nilai,
              type: test.type,
              waktu: moment(result[i].createdAt).format("DD-MM-YYYY HH:mm:ss"),
            });
          }
        }
      }

      const totalData = data.length;

      data = paginateArray(data, limit, page);

      const finalResult = {
        data,
        page,
        limit,
        totalData,
        datalength: data.length,
      };

      return response(200, finalResult, "Data nilai user didapatkan", res);
    } catch (error) {
      console.log(error);
      return response(500, error, error.message, res);
    }
  },

  getStudentData: async (req, res) => {
    try {
      const { id } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await testAnswer
        .find({
          class: id,
        })
        .populate("test");

      let data = [];
      let postTestId = null;
      let preTestId = null;
      let quizIds = [];

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "pre") {
          preTestId = result[i].test._id;

          break;
        }
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "post") {
          postTestId = result[i].test._id;

          break;
        }
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "quiz") {
          quizIds.push(result[i].test._id);
        }
      }

      const kelas = await Kelas.findById(id);

      let postTest = 0;
      let postTestDuration = "";
      let preTest = 0;
      let preTestDuration = "";
      let quiz = 0;
      let quizDuration = "";

      for (var i = 0; i < kelas.peserta.length; i++) {
        const user = await User.findById(kelas.peserta[i].user);

        if (user) {
          if (preTestId) {
            const preTestScore = await testAnswer.findOne({
              test: preTestId,
              $and: [
                {
                  class: id,
                },
                {
                  user: user._id,
                },
              ],
            });

            if (preTestScore) {
              preTest = preTestScore.nilai;
              preTestDuration = converttoMinute(
                converttoSecond(preTestScore.finishAt, preTestScore.startAt)
              );
            }
          }

          if (postTestId) {
            const postTestScore = await testAnswer
              .findOne({
                test: postTestId,
                $and: [
                  {
                    class: id,
                  },
                  {
                    user: user._id,
                  },
                ],
              })
              .populate("user", "name");

            if (postTestScore) {
              postTest = postTestScore.nilai;
              postTestDuration = converttoMinute(
                converttoSecond(postTestScore.finishAt, postTestScore.startAt)
              );
            }
          }

          let answer = 0;

          if (quizIds.length > 0) {
            let score = 0;
            let duration = 0;

            for (var j = 0; j < quizIds.length; j++) {
              const quizTest = await TestAnswer.findOne({
                test: quizIds[j],
                $and: [
                  {
                    class: id,
                  },
                  {
                    user: user._id,
                  },
                ],
              });

              if (quizTest) {
                score = score + quizTest.nilai;
                answer = answer + quizTest.answers.length;
                duration =
                  duration +
                  converttoSecond(quizTest.finishAt, quizTest.startAt);
              }
            }

            quiz = score / quizIds.length;
            quizDuration =
              duration > 0
                ? converttoMinute(Math.floor(duration / answer))
                : "00:00";
          }

          data.push({
            kelasId: id,
            userId: user._id,
            name: user.name,
            nipp: user.nipp,
            type: user.userType == 1 ? "Internal" : "External",
            preTest,
            preTestDuration,
            postTest,
            postTestDuration,
            quiz,
            quizDuration,
          });
        }
      }

      const totalData = data.length;

      data = paginateArray(data, limit, page);

      const finalResult = {
        data,
        page,
        limit,
        totalData,
        datalength: data.length,
      };

      return response(200, finalResult, "Data nilai user didapatkan", res);
    } catch (error) {
      console.log(error);
      return response(500, error, error.message, res);
    }
  },

  getStudentDataExport: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await testAnswer
        .find({
          class: id,
        })
        .populate("test");

      let data = [];

      let postTestId = null;
      let preTestId = null;
      let quizIds = [];

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "pre") {
          preTestId = result[i].test._id;

          break;
        }
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "post") {
          postTestId = result[i].test._id;

          break;
        }
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "quiz") {
          quizIds.push(result[i].test._id);
        }
      }

      const kelas = await Kelas.findById(id);

      let postTest = 0;
      let postTestDuration = "";
      let preTest = 0;
      let preTestDuration = "";
      let quiz = 0;
      let quizDuration = "";

      for (var i = 0; i < kelas.peserta.length; i++) {
        const user = await User.findById(kelas.peserta[i].user);

        if (user) {
          if (preTestId) {
            const preTestScore = await testAnswer.findOne({
              test: preTestId,
              $and: [
                {
                  class: id,
                },
                {
                  user: user._id,
                },
              ],
            });

            if (preTestScore) {
              preTest = preTestScore.nilai;
              preTestDuration = converttoMinute(
                converttoSecond(preTestScore.finishAt, preTestScore.startAt)
              );
            }
          }

          if (postTestId) {
            const postTestScore = await testAnswer
              .findOne({
                test: postTestId,
                $and: [
                  {
                    class: id,
                  },
                  {
                    user: user._id,
                  },
                ],
              })
              .populate("user", "name");

            if (postTestScore) {
              postTest = postTestScore.nilai;
              postTestDuration = converttoMinute(
                converttoSecond(postTest.finishAt, postTest.startAt)
              );
            }
          }

          answer = 0;

          if (quizIds.length > 0) {
            let score = 0;
            let duration = 0;

            for (var i = 0; i < quizIds.length; i++) {
              const quizTest = await TestAnswer.findOne({
                test: quizIds[i],
                $and: [
                  {
                    class: id,
                  },
                  {
                    user: user._id,
                  },
                ],
              });

              if (quizTest) {
                score = score + quizTest.nilai;
                answer = answer + quizTest.answers.length;

                duration =
                  duration +
                  converttoSecond(quizTest.finishAt, quizTest.startAt);
              }
            }

            quiz = score / quizIds.length;
            quizDuration = converttoMinute(Math.floor(duration / answer));
          }

          data.push({
            user: user.name,
            nipp: user.nipp,
            tipe_peserta: user.userType == 1 ? "Internal" : "External",
            nilai_pre_test: preTest.toString(),
            durasi_pre_test: preTestDuration.length > 0 ? preTestDuration : "-",
            nilai_quiz: quiz.toString(),
            durasi_quiz: quizDuration.length > 0 ? quizDuration : "-",
            nilai_post_test: postTest.toString(),
            durasi_post_test:
              postTestDuration.length > 0 ? postTestDuration : "-",
          });
        }
      }

      return response(200, data, "Data nilai user didapatkan", res);
    } catch (error) {
      console.log(error);
      return response(500, error, error.message, res);
    }
  },

  getStudentDataQuiz: async (req, res) => {
    try {
      const { id } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await testAnswer
        .find({
          class: id,
        })
        .populate("test");

      let data = [];
      let quizIds = [];
      let quiz = [];

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "quiz") {
          quizIds.push(result[i].test._id);
        }
      }

      const kelas = await Kelas.findById(id);

      let quizAverage = 0;
      let quizDurationAverage = "";

      for (var i = 0; i < kelas.peserta.length; i++) {
        let quizScoreLength = 0;
        let quizDurationLength = 0;

        const user = await User.findById(kelas.peserta[i].user);

        if (user) {
          if (quizIds.length > 0) {
            let duration = 0;
            let score = 0;

            for (var j = 0; j < quizIds.length; j++) {
              const quizTest = await TestAnswer.findOne({
                test: quizIds[j],
                $and: [
                  {
                    class: id,
                  },
                  {
                    user: user._id,
                  },
                ],
              });

              if (quizTest) {
                score = score + quizTest.nilai;
                quizScoreLength = quizScoreLength + quizTest.nilai;

                duration =
                  duration +
                  converttoSecond(quizTest.finishAt, quizTest.startAt);

                quizDurationLength =
                  quizDurationLength +
                  converttoSecond(quizTest.finishAt, quizTest.startAt);

                quiz.push({
                  nilai: quizTest.nilai,
                  durasi: converttoMinute(
                    converttoSecond(quizTest.finishAt, quizTest.startAt)
                  ),
                });
              }
            }

            quizAverage = quizScoreLength ? score / quizIds.length : 0;

            quizDurationAverage = quizDurationLength
              ? converttoMinute(Math.floor(duration / quizDurationLength))
              : "00:00";

            data.push({
              kelasId: id,
              userId: user._id,
              name: user.name,
              nipp: user.nipp,
              type: user.userType == 1 ? "Internal" : "External",
              quizAverage,
              quizDurationAverage,
              length: quizIds.length,
            });
          } else {
            data.push({
              kelasId: id,
              userId: user._id,
              name: user.name,
              nipp: user.nipp,
              type: user.userType == 1 ? "Internal" : "External",
              quizAverage: 0,
              quizDurationAverage: "",
              length: 0,
            });
          }
        }
      }

      const totalData = data.length;

      data = paginateArray(data, limit, page);

      const finalResult = {
        data,
        page,
        limit,
        totalData,
        datalength: data.length,
      };

      return response(200, finalResult, "Data nilai quiz user didapatkan", res);
    } catch (error) {
      console.log(error);
      return response(500, error, error.message, res);
    }
  },

  checkifTestHasBeenAnswered: async (req, res) => {
    try {
      const { id } = req.params;

      const hasBeenAnswered = await testAnswer.findOne({
        test: id,
        $and: [
          {
            user: req.user.id,
          },
        ],
      });

      return hasBeenAnswered
        ? response(200, { status: false }, "Test sudah dijawab", res)
        : response(200, { status: true }, "Test belum dijawab", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },

  getTestByClass: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await Kelas.findById(id).populate("materi");

      let data = [];
      let postTest = [];
      let preTest = [];
      let quiz = [];
      let postTestIds = [];
      let preTestIds = [];
      let quizIds = [];

      for (let i = 0; i < result.materi.length; i++) {
        preTestIds.push(result.materi[i].test.pre);
      }

      for (let i = 0; i < result.materi.length; i++) {
        postTestIds.push(result.materi[i].test.post);
      }

      for (let i = 0; i < result.materi.length; i++) {
        for (let j = 0; j < result.materi[i].items.length; j++) {
          quizIds.push(result.materi[i].items[j].quiz);
        }
      }
      if (preTestIds) {
        for (let i = 0; i < preTestIds.length; i++) {
          const preTestData = await Test.findById(preTestIds[i]).populate(
            "pembuat"
          );

          preTest.push(preTestData);
        }
      }

      if (postTestIds) {
        for (let i = 0; i < postTestIds.length; i++) {
          const postTestData = await Test.findById(postTestIds[i]).populate(
            "pembuat"
          );

          postTest.push(postTestData);
        }
      }

      if (quizIds.length > 0) {
        Promise.all(
          quizIds.map(async (q) => {
            const quizTest = await Test.findById(q).populate("pembuat");

            quiz.push(quizTest);
          })
        );
      }

      data.push({
        preTest,
        quiz,
        postTest,
      });

      return response(200, data, "Nilai Test di dapat", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },

  getTestByClassAnswered: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await testAnswer
        .find({
          class: id,
        })
        .populate("test");

      let data = [];
      let postTest = [];
      let preTest = [];
      let quiz = [];
      let postTestId = null;
      let preTestId = null;
      let quizIds = [];

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "pre") {
          preTestId = result[i].test._id;
          break;
        }
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "post") {
          postTestId = result[i].test._id;
          break;
        }
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].test.type == "quiz") {
          quizIds.push(result[i].test._id);
        }
      }

      if (preTestId) {
        const test = await testAnswer
          .find({
            class: id,
            $and: [
              {
                test: preTestId,
              },
            ],
          })
          .populate("test");

        if (test.length > 0) {
          await Promise.all(
            test.map(async (t) => {
              const user = await User.findById(t.user);

              preTest.push({
                user: user.name,
                userType: user.userType == 1 ? "Internal" : "External",
                nipp: user.nipp,
                nilai: t.nilai,
                durasi: converttoMinute(converttoSecond(t.finishAt, t.startAt)),
              });
            })
          );
        }
      }

      if (postTestId) {
        const test = await testAnswer
          .find({
            class: id,
            $and: [
              {
                test: postTestId,
              },
            ],
          })
          .populate("test");

        if (test.length > 0) {
          await Promise.all(
            test.map(async (t) => {
              const user = await User.findById(t.user);

              postTest.push({
                user: user.name,
                userType: user.userType == 1 ? "Internal" : "External",
                nipp: user.nipp,
                nilai: t.nilai,
                durasi: converttoMinute(converttoSecond(t.finishAt, t.startAt)),
              });
            })
          );
        }
      }

      if (quizIds.length > 0) {
        let nilai = 0;
        let duration = 0;

        const kelas = Kelas.findById(id);

        await Promise.all(
          kelas.map(async (k) => {
            k.peserta.map(async (p) => {
              const user = await User.findById(p.user);

              quizIds.map(async (q) => {
                const quizTest = await testAnswer
                  .find({
                    class: id,
                    $and: [
                      {
                        test: q,
                      },
                    ],
                  })
                  .populate("test");

                nilai = nilai + quizTest.nilai;
                duration =
                  duration +
                  converttoSecond(quizTest.finishAt, quizTest.startAt);
              });

              nilai = Math.floor(nilai / quizIds.length);
              duration = Math.floor(duration / quizIds.length);

              quiz.push({
                user: user.name,
                userType: user.userType == 1 ? "Internal" : "External",
                nipp: user.nipp,
                nilai,
                durasi: duration,
              });
            });
          })
        );
      }

      data.push({
        preTest,
        quiz,
        postTest,
      });

      return response(200, data, "Nilai Test di dapat", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },

  getTestAnswer: async (req, res) => {
    try {
      let user = req.query.user ?? null;
      let test = req.query.test ?? null;

      // console.log(user && test);

      let data = await testAnswer
        .find()
        .populate("user")
        .populate("test")
        .populate("class");

      if (user) {
        data = await testAnswer
          .find({ user })
          .populate("user")
          .populate("test")
          .populate("class");

        if (test) {
          data = await testAnswer
            .find({
              user,
              $and: [
                {
                  test,
                },
              ],
            })
            .populate("user")
            .populate("test")
            .populate("class");
        }
      } else if (test) {
        data = await testAnswer
          .find({ test })
          .populate("user")
          .populate("test")
          .populate("class");

        if (user) {
          data = await testAnswer
            .find({
              user,
              $and: [
                {
                  test,
                },
              ],
            })
            .populate("user")
            .populate("test")
            .populate("class");
        }
      }

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
    const { user, test, kelas, answers, startAt, finishAt } = req.body;

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
        startAt,
        finishAt,
      });

      const save = await answer.save();

      await countRanking(validKelas._id);

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

      const payload = {
        data: filteredData,
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
      response(500, error, error.message, res);
    }
  },

  nilai: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      let { data } = req.body;
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

  update: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;

      const { title } = req.body;

      const oldData = await Test.findById(id);

      if (!oldData) {
        return response(400, {}, "Data tidak ditemukan", res);
      }

      const result = await Test.findByIdAndUpdate(id, {
        judul: title,
      });

      return response(200, result, "Quiz Berhasil di perbaharui", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  addTestAnswer: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;

      let { index, value } = req.fields;

      const img = req.files["img"];

      const oldData = await Test.findById(id);

      if (!oldData) {
        return response(400, {}, "Data tidak ditemukan", res);
      }

      let isTrue = false;

      if (value.substr(value.length - 6) == "{true}") {
        isTrue = true;
        value = value.substring(0, value.length - 6);
      }

      const targetQuestion = oldData.question[index];
      const currentQuestionCount = oldData.question.length;
      const currentAnswerCount = targetQuestion.answer.length;

      session.startTransaction();

      let newAnswer = [];
      let newQuestion = [];

      for (let i = 0; i < currentAnswerCount; i++) {
        newAnswer.push(targetQuestion.answer[i]);
      }

      if (img !== undefined) {
        const today = new Date().toISOString().slice(0, 10);

        const folder = path.join(
          __dirname,
          "..",
          "upload",
          "test-answer-image",
          today,
          index,
          "new"
        );

        await fs.promises.mkdir(folder, { recursive: true });

        const format = "YYYYMMDDHHmmss";

        const date = new Date();

        const dateName = moment(date).format(format);

        let ext;

        if (img.type == "image/png") {
          ext = "png";
        } else if (img.type == "image/jpg") {
          ext = "jpg";
        } else if (img.type == "image/jpeg") {
          ext = "jpeg";
        }

        const filename = `/answer${dateName}${index}new.${ext}`;

        const newPath = folder + filename;

        var oldPath = img.path;

        fs.promises.copyFile(oldPath, newPath, 0, function (err) {
          if (err) throw err;
        });

        const filePath = `/upload/test-answer-image/${today}/${index}/new${filename}`;

        newAnswer.push({
          value,
          img: filePath,
          isTrue,
        });
      } else {
        newAnswer.push({
          value,
          img: "",
          isTrue,
        });
      }

      for (let i = 0; i < currentQuestionCount; i++) {
        if (index == i) {
          newQuestion.push({
            kode: targetQuestion.kode,
            value: targetQuestion.value,
            img: targetQuestion.img,
            type: targetQuestion.type,
            answer: newAnswer,
          });
        } else {
          newQuestion.push(oldData.question[i]);
        }
      }

      await Test.findByIdAndUpdate(id, {
        question: newQuestion,
      });

      const result = await Test.findById(id);

      return response(200, result, "Quiz Berhasil di perbaharui", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  deleteOneAnwer: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { idTest, idAnswer } = req.params;

      await Test.updateOne(
        { _id: idTest, "question.answer._id": idAnswer },
        { $pull: { "question.$[outer].answer": { _id: idAnswer } } },
        { arrayFilters: [{ "outer.answer._id": idAnswer }], session }
      );

      return response(200, {}, "Quiz Berhasil di perbaharui", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  deleteTestAnswer: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;

      let { index, answerIndex } = req.body;

      const oldData = await Test.findById(id);

      if (!oldData) {
        return response(400, {}, "Data tidak ditemukan", res);
      }

      const targetQuestion = oldData.question[index];
      const currentQuestionCount = oldData.question.length;
      const currentAnswerCount = targetQuestion.answer.length;

      session.startTransaction();

      let newAnswer = [];
      let newQuestion = [];

      for (let i = 0; i < currentAnswerCount; i++) {
        if (i !== answerIndex) {
          newAnswer.push(targetQuestion.answer[i]);
        }
      }

      for (let i = 0; i < currentQuestionCount; i++) {
        if (index == i) {
          newQuestion.push({
            kode: targetQuestion.kode,
            value: targetQuestion.value,
            img: targetQuestion.img,
            type: targetQuestion.type,
            answer: newAnswer,
          });
        } else {
          newQuestion.push(oldData.question[i]);
        }
      }

      await Test.findByIdAndUpdate(id, {
        question: newQuestion,
      });

      const result = await Test.findById(id);

      return response(200, result, "Quiz Berhasil di perbaharui", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  updateTestAnswer: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;

      let { answerIndex, index, value } = req.fields;

      const img = req.files["img"];

      const oldData = await Test.findById(id);

      if (!oldData) {
        return response(400, {}, "Data tidak ditemukan", res);
      }

      let isTrue = false;

      if (value.substr(value.length - 6) == "{true}") {
        isTrue = true;
        value = value.substring(0, value.length - 6);
      }

      const targetQuestion = oldData.question[index];
      const currentQuestionCount = oldData.question.length;
      const currentAnswerCount = targetQuestion.answer.length;

      session.startTransaction();

      let newAnswer = [];
      let newQuestion = [];

      for (let i = 0; i < currentAnswerCount; i++) {
        if (i == answerIndex) {
          if (img !== undefined) {
            const today = new Date().toISOString().slice(0, 10);

            const folder = path.join(
              __dirname,
              "..",
              "upload",
              "test-answer-image",
              today,
              index,
              answerIndex
            );

            await fs.promises.mkdir(folder, { recursive: true });

            const format = "YYYYMMDDHHmmss";

            const date = new Date();

            const dateName = moment(date).format(format);

            let ext;

            if (img.type == "image/png") {
              ext = "png";
            } else if (img.type == "image/jpg") {
              ext = "jpg";
            } else if (img.type == "image/jpeg") {
              ext = "jpeg";
            }

            const filename = `/answer${dateName}${index}${answerIndex}.${ext}`;

            const newPath = folder + filename;

            var oldPath = img.path;

            fs.promises.copyFile(oldPath, newPath, 0, function (err) {
              if (err) throw err;
            });

            const filePath = `/upload/test-answer-image/${today}/${index}/${answerIndex}${filename}`;

            newAnswer.push({
              value,
              img: filePath,
              isTrue,
            });
            // console.log(filePath, newAnswer);
          } else {
            newAnswer.push({
              value,
              img: targetQuestion.answer[i].img,
              isTrue,
            });
          }
        } else {
          newAnswer.push(targetQuestion.answer[i]);
        }
      }

      for (let i = 0; i < currentQuestionCount; i++) {
        if (index == i) {
          newQuestion.push({
            kode: targetQuestion.kode,
            value: targetQuestion.value,
            img: targetQuestion.img,
            type: targetQuestion.type,
            answer: newAnswer,
          });
        } else {
          newQuestion.push(oldData.question[i]);
        }
      }

      await Test.findByIdAndUpdate(id, {
        question: newQuestion,
      });

      const result = await Test.findById(id);

      return response(200, result, "Quiz Berhasil di perbaharui", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  addTestQuestion: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;

      const { value, type } = req.fields;

      const img = req.files["img"];

      const oldData = await Test.findById(id);

      if (!oldData) {
        return response(400, {}, "Data tidak ditemukan", res);
      }

      const currentQuestionCount = oldData.question.length;

      session.startTransaction();

      let newQuestion = [];

      for (let i = 0; i < currentQuestionCount; i++) {
        newQuestion.push(oldData.question[i]);
      }

      if (img !== undefined) {
        const today = new Date().toISOString().slice(0, 10);

        const folder = path.join(
          __dirname,
          "..",
          "upload",
          "test-question-image",
          today,
          "new"
        );

        await fs.promises.mkdir(folder, { recursive: true });

        const format = "YYYYMMDDHHmmss";

        const date = new Date();

        const dateName = moment(date).format(format);

        let ext;

        if (img.type == "image/png") {
          ext = "png";
        } else if (img.type == "image/jpg") {
          ext = "jpg";
        } else if (img.type == "image/jpeg") {
          ext = "jpeg";
        }
        const filename = `/question${dateName}new.${ext}`;

        const newPath = folder + filename;

        var oldPath = img.path;

        fs.promises.copyFile(oldPath, newPath, 0, function (err) {
          if (err) throw err;
        });

        const filePath = `/upload/test-question-image/${today}/new${filename}`;

        newQuestion.push({
          kode: makeid(8),
          value,
          img: filePath,
          type,
          answer: [],
        });
      } else {
        newQuestion.push({
          kode: makeid(8),
          value,
          img: null,
          type,
          answer: [],
        });
      }

      await Test.findByIdAndUpdate(id, {
        question: newQuestion,
      });

      const result = await Test.findById(id);

      return response(200, result, "Quiz Berhasil di perbaharui", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  deleteTestQuestion: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;

      const { index } = req.body;

      const oldData = await Test.findById(id);

      if (!oldData) {
        return response(400, {}, "Data tidak ditemukan", res);
      }

      const currentQuestionCount = oldData.question.length;

      session.startTransaction();

      let newQuestion = [];

      for (let i = 0; i < currentQuestionCount; i++) {
        if (i !== index) {
          newQuestion.push(oldData.question[i]);
        }
      }

      await Test.findByIdAndUpdate(id, {
        question: newQuestion,
      });

      const result = await Test.findById(id);

      return response(200, result, "Quiz Berhasil di perbaharui", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  updateTestQuestion: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const { id } = req.params;

      const { kode, index, value, type } = req.fields;

      const img = req.files["img"];

      const oldData = await Test.findById(id);

      if (!oldData) {
        return response(400, {}, "Data tidak ditemukan", res);
      }

      const targetQuestion = oldData.question[index];
      const currentQuestionCount = oldData.question.length;

      session.startTransaction();

      let newQuestion = [];

      for (let i = 0; i < currentQuestionCount; i++) {
        if (i == index) {
          if (img !== undefined) {
            const today = new Date().toISOString().slice(0, 10);

            const folder = path.join(
              __dirname,
              "..",
              "upload",
              "test-question-image",
              today,
              index
            );

            await fs.promises.mkdir(folder, { recursive: true });

            const format = "YYYYMMDDHHmmss";

            const date = new Date();

            const dateName = moment(date).format(format);

            let ext;

            if (img.type == "image/png") {
              ext = "png";
            } else if (img.type == "image/jpg") {
              ext = "jpg";
            } else if (img.type == "image/jpeg") {
              ext = "jpeg";
            }
            const filename = `/question${dateName}${index}.${ext}`;

            const newPath = folder + filename;

            var oldPath = img.path;

            fs.promises.copyFile(oldPath, newPath, 0, function (err) {
              if (err) throw err;
            });

            const filePath = `/upload/test-question-image/${today}/${index}${filename}`;

            newQuestion.push({
              kode,
              value,
              img: filePath,
              type,
              answer: targetQuestion.answer,
            });
          } else {
            newQuestion.push({
              kode,
              value,
              img: targetQuestion.img,
              type,
              answer: targetQuestion.answer,
            });
          }
        } else {
          newQuestion.push(oldData.question[i]);
        }
      }

      await Test.findByIdAndUpdate(id, {
        question: newQuestion,
      });

      const result = await Test.findById(id);

      return response(200, result, "Quiz Berhasil di perbaharui", res);
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
      const dirname = __dirname.replace("controllers", "");

      test.question.forEach((question) => {
        if (question.img != null) {
          fs.unlinkSync(path.join(dirname, question.img), {
            recursive: true,
            force: true,
          });
        }
        question.answer.forEach((answer) => {
          // console.log(answer);
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

      // console.log(req.files);

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
