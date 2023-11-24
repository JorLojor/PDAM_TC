const KelasModel = require("../models/kelas");
const Nipp = require("../models/nipp");
const readXlsxFile = require("read-excel-file/node");
const response = require("../respons/response");
const user = require("../models/user");

module.exports = {
  index: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);

      let data;
      let totalData = 0;

      totalData = await Nipp.countDocuments();

      if (isPaginate === 0) {
        data = await Nipp.find();

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get sertifikat berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      data = await Nipp.find()
        .skip((page - 1) * limit)
        .limit(limit);

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all Nipp", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  import: async (req, res) => {
    try {
      const excel = req.files["excel"];

      var path = excel.path;

      readXlsxFile(path).then((rows) => {
        rows.shift();

        rows.map(async (r) => {
          const registered = await Nipp.findOne({
            nipp: r[2],
          });

          if (!registered) {
            await Nipp.create({
              name: r[1],
              nipp: r[2],
            });
          }
        });
      });

      response(200, {}, "import data selesai", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  destroy: async (req, res) => {
    const id = req.params.id;

    try {
      const nipp = Nipp.findById(id);

      if (!nipp) {
        return response(400, {}, "Nipp tidak ditemukan", res);
      }

      const check = await user.findOne({ nipp: nipp.nipp });

      if (check.length > 0) {
        return response(400, {}, "Nipp masih digunakan pelatihan lain", res);
      }

      const result = await Nipp.findByIdAndRemove(id);

      response(200, result, "Nipp berhasil dihapus", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  show: async (req, res) => {
    try {
      const id = req.params.id;

      const data = await Nipp.findById(id);

      if (data) {
        response(200, data, "Berhasil get single Nipp", res);
      } else {
        response(400, data, "Nipp tidak ditemukan", res);
      }
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  showByNipp: async (req, res) => {
    try {
      const nipp = req.params.nipp;

      const data = await Nipp.findOne({ nipp });

      if (data) {
        response(200, data, "Berhasil get single Nipp", res);
      } else {
        response(400, data, "Nipp tidak ditemukan", res);
      }
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    const { name, nipp } = req.body;

    const exist = await Nipp.findOne({
      nipp,
    });

    if (exist) {
      return response(400, {}, "Nipp sudah terdaftar", res);
    }

    try {
      const data = await Nipp.create({ name, nipp });

      response(200, data, "Nipp berhasil ditambahkan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { name, nipp } = req.body;

    const exist = await Nipp.findOne({
      nipp,
      $and: [
        {
          _id: { $ne: id },
        },
      ],
    });

    if (exist) {
      return response(400, {}, "Nipp sudah terdaftar", res);
    }

    try {
      const data = await Nipp.findByIdAndUpdate(
        id,
        { name, nipp },
        { new: true }
      );

      response(200, data, "Nipp berhasil di perbaharui", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
};
