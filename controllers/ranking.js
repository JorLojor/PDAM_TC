const Kelas = require("../models/kelas");
const Ranking = require("../models/ranking");
const response = require("../respons/response");

module.exports = {
  index: async (req, res) => {
    try {
      const { id } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      let data;
      let totalData = 0;

      const kelas = await Kelas.findById(id);

      totalData = await Ranking.countDocuments({
        kelas,
      });

      if (!kelas) {
        response(400, {}, "Kelas tidak ditemukan", res);
      }

      if (page === 0) {
        data = await Ranking.find({
          kelas,
        })
          .populate("user")
          .populate("kelas");
      } else {
        data = await Ranking.find({
          kelas,
        })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("user")
          .populate("kelas");
      }

      result = {
        data,
        page,
        limit: page === 0 ? "" : limit,
        totalData,
        datalength: data.length,
      };

      response(200, result, "Berhasil get all ranking", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
};
