const evaluationForm = require("../models/evaluationForm");

const response = require("../respons/response");

module.exports = {
  index: async (req, res) => {
    try {
      const data = await evaluationForm.find();

      const result = {
        data,
        "total data": data.length,
      };

      return response(200, result, "get form evaluasi", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
};
