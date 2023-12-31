const EvaluationForm = require("../models/evaluationForm");
const EvaluationFormAnswer = require("../models/evaluationFormAnswer");
const evaluationFormMessage = require("../models/evaluationFormMessage");
const EvaluationFormResult = require("../models/evaluationFormResult");
const EvaluationFormQuestion = require("../models/evaluationFormQuestion");
const Kelas = require("../models/kelas");
const User = require("../models/user");

const response = require("../respons/response");
const { paginateArray } = require("../service/index.js");
const { default: mongoose } = require("mongoose");

module.exports = {
  index: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      let result;

      if (page == 0) {
        const data = await EvaluationForm.find();

        result = {
          data,
          "total data": data.length,
        };
      } else {
        const data = await EvaluationForm.find()
          .skip((page - 1) * limit)
          .limit(limit);

        result = {
          data,
          "total data": data.length,
        };
      }

      return response(200, result, "get form evaluasi", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  check: async (req, res) => {
    try {
      const { kelas } = req.params;

      let data = await EvaluationFormResult.find({
        kelas,
        $and: [
          {
            user: req.user._id,
          },
        ],
      });

      if (data) {
        return response(
          200,
          { status: true },
          "sudah mengisi evaluasi ini",
          res
        );
      } else {
        return response(
          200,
          { status: false },
          "belum mengisi evaluasi ini",
          res
        );
      }
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  getResult: async (req, res) => {
    try {
      const kelas = req.params.kelas;

      const validClass = await Kelas.findById(kelas);

      if (!validClass) {
        return response(400, {}, "kelas tidak ditemukan", res);
      }

      const targetClass = await Kelas.findById(kelas).populate("peserta");

      let data = [];

      const p = targetClass.peserta;

      for (let i = 0; i < p.length; i++) {
        let evaluationResult = await EvaluationFormResult.find({
          kelas,
          $and: [
            {
              user: new mongoose.Types.ObjectId(p[i].user),
            },
          ],
        }).populate("user");

        if (evaluationResult.length > 2) {
          let nilaiInstruktur = 0;

          if (evaluationResult.length > 3) {
            let nilaiIntrukturTotal = 0;

            for (let i = 2; i < evaluationResult.length; i++) {
              nilaiIntrukturTotal =
                nilaiIntrukturTotal + evaluationResult[i].instruktur;
            }

            nilaiInstruktur =
              nilaiIntrukturTotal - (evaluationResult.length - 2);
          } else {
            nilaiInstruktur = evaluationResult[2].instruktur;
          }

          data.push({
            _id: evaluationResult[0]._id,
            kelas: evaluationResult[0].kelas,
            user: evaluationResult[0].user,
            sapras: evaluationResult[0].sapras,
            materi: evaluationResult[1].materi,
            instruktur: nilaiInstruktur,
            createdAt: evaluationResult[0].createdAt,
            updatedAt: evaluationResult[0].updatedAt,
          });
        }
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const classDataSum = await EvaluationFormResult.find({
        kelas,
      }).countDocuments();

      if (!data) data = [];

      data = paginateArray(data, limit, page);

      let result = {
        data,
        page,
        limit,
        totalData: classDataSum,
        datalength: data.length,
      };

      return response(200, result, "Data hasil form", res);
    } catch (error) {
      console.log(error);
      return response(500, error, "Server error", res);
    }
  },

  getResultByInstructor: async (req, res) => {
    try {
      const kelas = req.params.kelas;

      const validClass = await Kelas.findById(kelas);

      if (!validClass) {
        return response(400, {}, "kelas tidak ditemukan", res);
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      let data = await EvaluationFormResult.find({
        kelas,
      }).populate("user");

      const totalData = data.length;

      if (page > 0) {
        data = await EvaluationFormResult.find({
          kelas,
        })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("user");
      }

      if (!data) data = [];

      let result = {
        data,
        page,
        limit,
        totalData,
        datalength: data.length,
      };

      return response(200, result, "Data hasil form", res);
    } catch (error) {
      console.log(error);
      return response(500, error, "Server error", res);
    }
  },

  getResultDetail: async (req, res) => {
    try {
      const { kelas, user } = req.params;

      const { instruktur } = req.query;

      const validUser = await User.findById(user);

      if (!validUser) return response(400, {}, "User tidak ditemukan", res);

      const form = await EvaluationForm.find();

      let message = [];

      let result;

      if (instruktur) {
        const validInstruktur = await User.findById(instruktur);

        if (!validInstruktur) {
          return response(400, {}, "Instruktur tidak ditemukan", res);
        }

        let ids = [];

        for (let i = 0; i < form.length; i++) {
          if (form[i].name == "Sapras" || form[i].name == "Materi") {
            const resultByForm = await EvaluationFormAnswer.find({
              kelas,
              $and: [
                {
                  user,
                },
                {
                  evaluationForm: form[i]._id,
                },
              ],
            });

            if (resultByForm.length > 0) {
              for (let j = 0; j < resultByForm.length; j++) {
                ids.push(resultByForm[j]._id);
              }
            }
          } else if (form[i].name == "Instruktur") {
            const resultByForm = await EvaluationFormAnswer.find({
              kelas,
              $and: [
                {
                  user,
                },
                {
                  evaluationForm: form[i]._id,
                },
                {
                  instructor: instruktur,
                },
              ],
            });

            if (resultByForm.length > 0) {
              for (let j = 0; j < resultByForm.length; j++) {
                ids.push(resultByForm[j]._id);
              }
            }
          }
        }

        if (ids.length > 0) {
          result = await EvaluationFormAnswer.find({
            _id: { $in: ids },
          })
            .populate("user")
            .populate("evaluationForm")
            .populate("evaluationFormQuestion")
            .populate("instructor")
            .populate("kelas");

          if (result.length > 0) {
            let instructorIds = [];

            for (let i = 0; i < result.length; i++) {
              if (result[i].instructor) {
                instructorIds.push(result[i].instructor._id);
              }
            }

            const instructor = await User.findById(instruktur);

            for (let i = 0; i < form.length; i++) {
              if (form[i].name == "Sapras") {
                const messageData = await evaluationFormMessage.findOne({
                  kelas,
                  $and: [
                    {
                      user,
                    },
                    {
                      evaluationForm: form[i]._id,
                    },
                  ],
                });

                message.push({
                  form: form[i].name,
                  instructor: "",
                  message: messageData.message,
                });
              } else if (form[i].name == "Instruktur") {
                const messageData = await evaluationFormMessage.findOne({
                  kelas,
                  $and: [
                    {
                      user,
                    },
                    {
                      evaluationForm: form[i]._id,
                    },
                    {
                      instructor,
                    },
                  ],
                });

                message.push({
                  form: form[i].name,
                  instructor: instructor.name,
                  message: messageData.message,
                });
              } else if (form[i].name == "Materi") {
                const messageData = await evaluationFormMessage.findOne({
                  kelas,
                  $and: [
                    {
                      user,
                    },
                    {
                      evaluationForm: form[i]._id,
                    },
                  ],
                });

                message.push({
                  form: form[i].name,
                  instructor: "",
                  message: messageData.message,
                });
              }
            }
          }
        }
      } else {
        result = await EvaluationFormAnswer.find({
          kelas,
          $and: [
            {
              user,
            },
          ],
        })
          .populate("user")
          .populate("evaluationForm")
          .populate("evaluationFormQuestion")
          .populate("instructor")
          .populate("kelas");

        if (result.length > 0) {
          let instructorIds = [];

          for (let i = 0; i < result.length; i++) {
            if (result[i].instructor) {
              instructorIds.push(result[i].instructor._id);
            }
          }

          const instructor = await User.find({
            _id: { $in: instructorIds },
          });

          for (let i = 0; i < form.length; i++) {
            if (form[i].name == "Sapras") {
              const messageData = await evaluationFormMessage.findOne({
                kelas,
                $and: [
                  {
                    user,
                  },
                  {
                    evaluationForm: form[i]._id,
                  },
                ],
              });

              message.push({
                form: form[i].name,
                instructor: "",
                message: messageData.message,
              });
            } else if (form[i].name == "Instruktur") {
              for (let j = 0; j < instructor.length; j++) {
                const messageData = await evaluationFormMessage.findOne({
                  kelas,
                  $and: [
                    {
                      user,
                    },
                    {
                      evaluationForm: form[i]._id,
                    },
                    {
                      instructor: instructor[j]._id,
                    },
                  ],
                });

                message.push({
                  form: form[i].name,
                  instructor: instructor[j].name,
                  message: messageData.message,
                });
              }
            } else if (form[i].name == "Materi") {
              const messageData = await evaluationFormMessage.findOne({
                kelas,
                $and: [
                  {
                    user,
                  },
                  {
                    evaluationForm: form[i]._id,
                  },
                ],
              });

              message.push({
                form: form[i].name,
                instructor: "",
                message: messageData.message,
              });
            }
          }
        }
      }

      const data = {
        result,
        message,
      };

      return response(200, data, "Data detail hasil form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  getResultDetailByInstructor: async (req, res) => {
    try {
      const { kelas, user } = req.params;

      let answers = [];
      let message = [];

      const result = await EvaluationFormAnswer.find({
        kelas,
        $and: [
          {
            user,
          },
          {
            instructor: req.user.id,
          },
        ],
      })
        .populate("user")
        .populate("evaluationForm")
        .populate("evaluationFormQuestion")
        .populate("instructor")
        .populate("kelas");

      if (result.length > 0) {
        const form = await EvaluationForm.find();

        for (let i = 0; i < form.length; i++) {
          if (form[i].name == "Instruktur") {
            const messageData = await evaluationFormMessage.findOne({
              kelas: result.kelas,
              $and: [
                {
                  user: result.user,
                },
                {
                  evaluationForm: form[i]._id,
                },
                {
                  instructor: req.user.id,
                },
              ],
            });

            message.push({
              form: form[i].name,
              instructor: instructor[j].name,
              message: messageData.message,
            });

            questions = await EvaluationFormQuestion.find({
              evaluationForm: form[i]._id,
            });

            for (let j = 0; j < questions.length; j++) {
              const answer = await EvaluationFormAnswer.findOne({
                kelas,
                $and: [
                  {
                    user,
                  },
                  {
                    evaluationFormQuestion: questions[j],
                  },
                  {
                    instructor: req.user.id,
                  },
                ],
              });

              answers.push({
                question: questions[j].name,
                answer: answer.value,
              });
            }
          }
        }
      }

      const data = {
        result,
        message,
        answers,
      };

      return response(200, data, "Data detail hasil form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
};
