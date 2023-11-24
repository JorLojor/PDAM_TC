const KelasModel = require("../models/kelas");
const TrainingMethod = require("../models/trainingMethod");
const response = require("../respons/response");

module.exports = {
  index: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);

      let data;
      let totalData = 0;

      totalData = await TrainingMethod.countDocuments();

      if (isPaginate === 0) {
        data = await TrainingMethod.find();

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get metode pelatihan berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      data = await TrainingMethod.find()
        .skip((page - 1) * limit)
        .limit(limit);

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all metode pelatihan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  destroy: async (req, res) => {
    const id = req.params.id;

    try {
      const check = await KelasModel.find({ TrainingMethod: id });

      if (check.length > 0) {
        return response(
          400,
          {},
          "Metode pelatihan masih digunakan pelatihan lain",
          res
        );
      }

      const result = await TrainingMethod.findByIdAndRemove(id);

      response(200, result, "Metode Pelatihan berhasil dihapus", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  show: async (req, res) => {
    try {
      const id = req.params.id;

      const data = await TrainingMethod.findById(id);

      if (data) {
        response(200, data, "Berhasil get single metode pelatihan", res);
      } else {
        response(400, data, "metode pelatihan tidak ditemukan", res);
      }
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    const { name } = req.body;

    const nameExist = await TrainingMethod.findOne({ name });

    if (nameExist) {
      return response(400, {}, "Metode Pelatihan sudah terdaftar", res);
    }

    try {
      const data = await TrainingMethod.create({ name });

      response(200, data, "Metode Pelatihan berhasil di buat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const nameExist = await TrainingMethod.findOne({
      name,
      $and: [
        {
          _id: { $ne: id },
        },
      ],
    });

    if (nameExist) {
      return response(400, {}, "Metode Pelatihan sudah terdaftar", res);
    }

    try {
      const data = await TrainingMethod.findByIdAndUpdate(
        id,
        { name },
        { new: true }
      );

      response(200, data, "Metode Pelatihan berhasil di perbaharui", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
};
