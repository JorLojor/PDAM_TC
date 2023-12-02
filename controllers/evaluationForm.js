const EvaluationForm = require("../models/evaluationForm");
const EvaluationFormAnswer = require("../models/evaluationFormAnswer");
const evaluationFormMessage = require("../models/evaluationFormMessage");
const EvaluationFormResult = require("../models/evaluationFormResult");
const EvaluationFormQuestion = require("../models/evaluationFormQuestion");
const Kelas = require("../models/kelas");
const User = require("../models/user");

const response = require("../respons/response");

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

      let message = [];

      const result = await EvaluationFormAnswer.find({
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
        const form = await EvaluationForm.find();

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
