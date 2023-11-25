const EvaluationForm = require("../models/evaluationForm");
const EvaluationFormQuestion = require("../models/evaluationFormQuestion");

const response = require("../respons/response");

module.exports = {
  index: async (req, res) => {
    try {
      const data = await EvaluationFormQuestion.find().populate(
        "evaluationForm"
      );

      const result = {
        data,
        "total data": data.length,
      };

      return response(200, result, "get pertanyaan form evaluasi", res);
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
