const EvaluationForm = require("../models/evaluationForm");
const EvaluationFormAnswer = require("../models/evaluationFormAnswer");
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

  getResult: async (req, res) => {
    try {
      const kelas = req.params.kelas;

      const validClass = await Kelas.findById(kelas);

      if (!validClass) {
        return response(400, {}, "kelas tidak ditemukan", res);
      }

      const result = await EvaluationFormResult.findOne({
        kelas,
      }).populate("user");

      if (!result) result = {};

      return response(200, result, "Data hasil form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  getResultDetail: async (req, res) => {
    try {
      const { kelas, user } = req.params;

      const result = await EvaluationFormAnswer.findOne({
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

      return response(200, result, "Data detail hasil form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
};
