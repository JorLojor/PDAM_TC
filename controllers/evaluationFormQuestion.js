const EvaluationForm = require("../models/evaluationForm");
const EvaluationFormAnswer = require("../models/evaluationFormAnswer");
const evaluationFormMessage = require("../models/evaluationFormMessage");
const EvaluationFormQuestion = require("../models/evaluationFormQuestion");
const EvaluationFormResult = require("../models/evaluationFormResult");
const Kelas = require("../models/kelas");

const response = require("../respons/response");

module.exports = {
  index: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      let result;

      if (page == 0) {
        const data = await EvaluationFormQuestion.find().populate(
          "evaluationForm"
        );

        result = {
          data,
          "total data": data.length,
        };
      } else {
        const data = await EvaluationFormQuestion.find()
          .populate("evaluationForm")
          .skip((page - 1) * limit)
          .limit(limit);

        result = {
          data,
          "total data": data.length,
        };
      }

      return response(200, result, "get pertanyaan form evaluasi", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
  answer: async (req, res) => {
    try {
      const {
        kelas,
        evaluationForm,
        evaluationFormQuestion,
        instructor,
        value,
        message,
      } = req.body;

      const user = req.user.id;

      if (!kelas) {
        return response(400, {}, "mohon isi kelas", res);
      } else if (!evaluationForm) {
        return response(400, {}, "mohon isi id form", res);
      } else if (!evaluationFormQuestion) {
        return response(400, {}, "mohon isi id pertanyaan", res);
      } else if (!value) {
        return response(400, {}, "mohon isi id jawaban", res);
      } else if (value.length !== evaluationFormQuestion.length) {
        return response(
          400,
          {},
          "jumlah jawaban dan pertanyaan tidak sesuai",
          res
        );
      }

      const validClass = await Kelas.findById(kelas);

      if (!validClass) {
        return response(400, {}, "kelas tidak ditemukan", res);
      }

      const validForm = await EvaluationForm.findById(evaluationForm);

      if (!validForm) {
        return response(400, {}, "form tidak ditemukan", res);
      }

      let isRegistered = false;

      user.kelas.map((m) => {
        if (m.kelas.toHexString() == validClass._id.toHexString()) {
          if (m.isDone == true) {
            isRegistered = true;
          } else {
            return response(400, {}, "Anda belum menyelesaikan kelas ini", res);
          }
        }
      });

      if (!isRegistered) {
        return response(400, {}, "Anda tidak terdaftar di kelas ini", res);
      }

      for (let i = 0; i < value.length; i++) {
        const validQuestion = await EvaluationFormQuestion.findOne({
          _id: evaluationFormQuestion[i],
          $and: [
            {
              evaluationForm,
            },
          ],
        });

        if (!validQuestion) {
          return response(400, {}, "Pertanyaan tidak terdaftar", res);
        }
      }

      for (let i = 0; i < value.length; i++) {
        await EvaluationFormAnswer.create({
          kelas,
          user,
          evaluationForm,
          evaluationFormQuestion: evaluationFormQuestion[i],
          instructor,
          value: value[i],
        });
      }

      await evaluationFormMessage.create({
        kelas,
        user,
        evaluationForm,
        message,
        instructor,
      });

      return response(200, {}, "Berhasil menjawab pertanyaan", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
  destroy: async (req, res) => {
    try {
      const id = req.params.id;

      const result = await EvaluationFormQuestion.findByIdAndRemove(id);

      return response(200, result, "Berhasil hapus pertanyaan", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
  generateResult: async (req, res) => {
    try {
      const { kelas } = req.body;

      const user = req.user.id;

      if (!kelas) {
        return response(400, {}, "mohon isi kelas", res);
      }

      const validClass = await Kelas.findById(kelas);

      if (!validClass) {
        return response(400, {}, "kelas tidak ditemukan", res);
      }

      const form = await EvaluationForm.find();

      await Promise.all(
        form.map(async (f) => {
          const question = await EvaluationFormQuestion.find({
            evaluationForm: f._id,
          }).countDocuments();

          const answer = await EvaluationFormAnswer.find({
            evaluationForm: f._id,
            $and: [
              {
                user,
              },
              {
                kelas,
              },
            ],
          });

          let answerValue = 0;

          answer.map((a) => {
            answerValue = answerValue + a.value;
          });

          const hasResult = await EvaluationFormResult.findOne({
            kelas,
            $and: [
              {
                user,
              },
            ],
          });

          if (f.name == "Sapras") {
            if (!hasResult) {
              await EvaluationFormResult.create({
                kelas,
                user,
                sapras: answerValue / question,
              });
            } else {
              await EvaluationFormResult.findByIdAndUpdate(
                hasResult._id,
                {
                  sapras: answerValue / question,
                },
                { new: true }
              );
            }
          } else if (f.name == "Instruktur") {
            const answerCount = await EvaluationFormAnswer.find({
              evaluationForm: f._id,
              $and: [
                {
                  user,
                },
                {
                  kelas,
                },
              ],
            }).countDocuments();

            const multi = answerCount / question;

            if (!hasResult) {
              await EvaluationFormResult.create({
                kelas,
                user,
                instruktur: answerValue / (question * multi),
              });
            } else {
              await EvaluationFormResult.findByIdAndUpdate(
                hasResult._id,
                {
                  instruktur: answerValue / (question * multi),
                },
                { new: true }
              );
            }
          } else if (f.name == "Materi") {
            if (!hasResult) {
              await EvaluationFormResult.create({
                kelas,
                user,
                materi: answerValue / question,
              });
            } else {
              await EvaluationFormResult.findByIdAndUpdate(
                hasResult._id,
                {
                  materi: answerValue / question,
                },
                { new: true }
              );
            }
          }
        })
      );

      return response(200, {}, "Berhasil generate hasil form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
  getbyForm: async (req, res) => {
    try {
      const evaluationForm = req.params.evaluationForm;

      const validForm = await EvaluationForm.findById(evaluationForm);

      if (!validForm) {
        return response(400, {}, "form tidak ditemukan", res);
      }

      const result = await EvaluationFormQuestion.findOne({
        evaluationForm,
      }).populate("evaluationForm");

      return response(200, result, "Data pertanyaan form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
  show: async (req, res) => {
    try {
      const id = req.params.id;

      const result = await EvaluationFormQuestion.findById(id).populate(
        "evaluationForm"
      );

      return response(200, result, "Data pertanyaan form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
  store: async (req, res) => {
    try {
      const { name, evaluationForm } = req.body;

      if (!name) {
        return response(400, {}, "mohon isi nama pertanyaan", res);
      } else if (!evaluationForm) {
        return response(400, {}, "mohon isi id form", res);
      }

      const validForm = await EvaluationForm.findById(evaluationForm);

      if (!validForm) {
        return response(400, {}, "form tidak ditemukan", res);
      }

      const result = await EvaluationFormQuestion.create({
        name,
        evaluationForm,
      });

      return response(200, result, "Berhasil tambah pertanyaan", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { name, evaluationForm } = req.body;

      if (!name) {
        return response(400, {}, "mohon isi nama pertanyaan", res);
      } else if (!evaluationForm) {
        return response(400, {}, "mohon isi id form", res);
      }

      const validForm = await EvaluationForm.findById(evaluationForm);

      if (!validForm) {
        return response(400, {}, "form tidak ditemukan", res);
      }

      const result = await EvaluationFormQuestion.findByIdAndUpdate(
        id,
        {
          name,
          evaluationForm,
        },
        { new: true }
      );

      return response(200, result, "Berhasil update pertanyaan", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
};
