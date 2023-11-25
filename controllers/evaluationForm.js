const EvaluationForm = require("../models/evaluationForm");
const EvaluationFormAnswer = require("../models/evaluationFormAnswer");
const EvaluationFormResult = require("../models/evaluationFormResult");
const Kelas = require("../models/kelas");

const response = require("../respons/response");

module.exports = {
  index: async (req, res) => {
    try {
      const data = await EvaluationForm.find();

      const result = {
        data,
        "total data": data.length,
      };

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

      return response(200, result, "Data hasil form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
  getResultDetail: async (req, res) => {
    try {
      const { kelas, user } = req.params;

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

      return response(200, result, "Data detail hasil form", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
};
