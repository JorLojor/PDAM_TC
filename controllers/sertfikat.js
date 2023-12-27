const mongoose = require("mongoose");
const KelasModel = require("../models/kelas");
const sertifikatModel = require("../models/sertifikat");
const response = require("../respons/response");

module.exports = {
  getSertifikat: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);
      const nama = req.query.nama;

      let data;
      let totalData = 0;

      if (nama) {
        totalData = await sertifikatModel.find({ nama }).countDocuments();
      } else {
        totalData = await sertifikatModel.countDocuments();
      }

      if (isPaginate === 0) {
        if (nama) {
          data = await sertifikatModel.find({ nama });
        } else {
          data = await sertifikatModel.find();
        }

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get sertifikat berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (nama) {
        data = await sertifikatModel
          .find({ nama })
          // .skip((page - 1) * limit)
          .limit(limit);
      } else {
        data = await sertifikatModel
          .find()
          // .skip((page - 1) * limit)
          // .limit(limit);
      }

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all sertifikat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getSertifikatReactSelect: async (req, res) => {
    try {
      const data = await sertifikatModel.find();

      const mapped = data.map((val, idx) => {
        return {
          value: val._id,
          label: val.nama,
          src: val.desain,
          namePosition: val.namePosition,
        };
      });

      result = {
        data: mapped,
      };

      response(200, result, "Berhasil get all sertifikat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getSinglesertifikat: async (req, res) => {
    try {
      const idsertifikat = req.params.id;
      const sertifikat = await sertifikatModel.findById(idsertifikat);

      if (sertifikat) {
        response(200, sertifikat, "Berhasil get single sertifikat", res);
      } else {
        response(400, idsertifikat, "sertifikat tidak ditemukan", res);
      }
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  createSeritifikat: async (req, res) => {
    const { nama, namePosition, kelasPosition, fotoPosition } = req.body;

    if (!req.file) {
      response(400, null, "Gambar desain harus diupload!", res);
      return;
    }
    let path = req.file.path.replaceAll("\\", "/");
    let desain = "/upload/" + path.split("/upload/")[1];

    try {
      const sertifikat = new sertifikatModel({
        nama,
        desain,
        namePosition: JSON.parse(namePosition),
        kelasPosition: JSON.parse(kelasPosition),
        fotoPosition: JSON.parse(fotoPosition),
      });

      const result = await sertifikat.save();

      response(200, result, "Desain Sertifikat berhasil di buat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updateSertifikat: async (req, res) => {
    const id = req.params.id;

    let { nama, namePosition, kelasPosition, fotoPosition } = req.body;

    const oldData = await sertifikatModel.findById(id);

    let desain;

    if (req.file) {
      desain = "/upload/" + req.file.path.split("/upload/")[1];
    } else {
      desain = oldData.desain;
    }

    try {
      const sertifikat = await sertifikatModel.findByIdAndUpdate(
        id,
        {
          nama,
          desain,
          namePosition,
          kelasPosition,
          fotoPosition,
        },
        {
          new: true,
        }
      );
      response(200, sertifikat, "sertifikat berhasil di update", res);
    } catch (error) {
      response(500, error, "Server error failed to update", res);
    }
  },

  deleteSertifikat: async (req, res) => {
    const id = req.params.id;
    try {
      const check = await KelasModel.find();

      const kelasHasSameCertificate = check.filter(
        (v) =>
          (v.desainSertifikat &&
            v.desainSertifikat.peserta.toString() === id) ||
          (v.desainSertifikat &&
            v.desainSertifikat.instruktur.toString() === id)
      );

      if (kelasHasSameCertificate.length !== 0) {
        return response(
          400,
          {},
          "sertifikat sedang digunakan, tidak dapat dihapus",
          res
        );
      }

      const result = await sertifikatModel.findByIdAndDelete(id);

      response(200, result, "sertifikat berhasil di hapus", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  deleteSertifikatKelas: async (req, res) => {
    const id = req.params.id;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const check = await KelasModel.findById(id);

      if (!check) {
        return response(400, {}, "kelas tidak ditemukan", res);
      }

      await KelasModel.findByIdAndUpdate(
        id,
        { desainSertifikat: null },
        { new: true, session }
      );
      response(200, result, "sertifikat berhasil di hapus", res);
      await session.commitTransaction();
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },
};
