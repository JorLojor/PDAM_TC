const mongoose = require("mongoose");
const KelasModel = require("../models/kelas");
const UserModel = require("../models/user");
const calonPesertaSchema = require("../models/calonpeserta");
const RecentClass = require("../models/recentClass");
const response = require("../respons/response");
const uploadImage = require("../middleware/imagepath");
const multer = require("multer");
const _ = require("lodash");
const { default: axios } = require("axios");

module.exports = {
  getAllKelas: async (req, res) => {
    try {
      const halaman = parseInt(req.query.halaman) || 1;
      const batas = parseInt(req.query.batas) || 5;
      const totalData = await KelasModel.countDocuments();

      const data = await KelasModel.find()
        .skip((halaman - 1) * batas)
        .limit(batas)
        .populate("materi kategori");

      for (const kelas of data) {
        for (let i = 0; i < kelas.peserta.length; i++) {
          const peserta = kelas.peserta[i];
          const userData = await UserModel.findOne({
            _id: peserta.user,
          });
          if (userData) {
            kelas.peserta[i].user = userData;
          }
        }
      }

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "berhasil Get all kelas", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  nilaiPerKelas: async (req, res) => {
    const kelasId = req.params.id;
    try {
      const kelas = await KelasModel.findById(kelasId).populate("materi");
      if (!kelas) {
        return response(404, null, "Kelas tidak ditemukan", res);
      }

      const nilaiPermateri = kelas.materi.map(
        (materi) => materi.nilaiPermateri
      );
      const totalNilai = nilaiPermateri.reduce((acc, curr) => acc + curr, 0);
      const rataRata = totalNilai / nilaiPermateri.length;

      kelas.nilaiperkelas = rataRata;
      await kelas.save();

      response(200, kelas, "Nilai rata-rata kelas berhasil di update", res);
    } catch (error) {
      console.log(error.message);
      response(500, error, "Server error", res);
    }
  },

  getOneKelas: async (req, res) => {
    const id = req.params.id;

    try {
      let kelas = await KelasModel.findById(id).populate("materi peserta");

      if (!kelas) {
        response(404, id, "Kelas tidak ditemukan", res);
      }

      response(200, kelas, "kelas ditemukan", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  getOneKelasBySlug: async (req, res) => {
    const slug = req.params.slug;

    try {
      let kelas = await KelasModel.findOne({ slug: slug })
        .populate("materi peserta kategori")
        .populate({
          path: "desainSertifikat.peserta",
          model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
        })
        .populate({
          path: "desainSertifikat.instruktur",
          model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
        });

      if (!kelas) {
        response(404, id, "Kelas tidak ditemukan", res);
      }

      response(200, kelas, "kelas ditemukan", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  getOneKelasByND: async (req, res) => {
    const kodeNotaDinas = req.body.kodeNotaDinas;

    try {
      let kelas = await KelasModel.findOne({
        kodeNotaDinas: kodeNotaDinas,
      }).populate("materi peserta kategori status");

      if (!kelas) {
        res.status(404).json(kelas);
        return;
      }

      res.json(kelas);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getKelasByInstruktur: async (req, res) => {
    const { instruktur } = req.params;

    try {
      const get = await KelasModel.find({ instruktur })
        .populate("materi kategori")
        .populate({
          path: "materi.items.tugas",
          model: "Tugas",
        })
        .lean()
        .exec();
      response(200, get, "Kelas berhasil ditemukan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  createKelasTest: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        kodeKelas,
        nama,
        harga,
        kapasitasPeserta,
        description,
        methods,
        kategori,
        instruktur,
        peserta = [],
        materi,
        jadwal,
        kelasType,
        kodeNotaDinas,
        link,
        absensi,
      } = req.body;

      let imageKelas = null;
      let status = "pending";

      if (req.file) {
        imageKelas = req.file.path.split("/PDAM_TC/")[1];
      }

      const checkKelas = await KelasModel.findOne({ kodeNotaDinas }).session(
        session
      );

      if (checkKelas) {
        response(
          403,
          checkKelas,
          `Kode Nota Dinas sudah terdaftar di kelas lain! (${checkKelas.nama})`,
          res
        );
        await session.abortTransaction();
        return;
      }

      const getND = await axios.post(
        process.env.url_rab + "nd/global/check",
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.key_for_grant_access}`,
          },
        }
      );

      if (getND.data) {
        const filtered = getND.data.filter((v) => v.kodeND === kodeNotaDinas);
        if (filtered.length !== 0) {
          status =
            filtered[0].status === "pending"
              ? "pending"
              : filtered[0].status === "Approved"
              ? "draft"
              : "declined";
        }
      }

      const kelas = new KelasModel({
        kodeKelas,
        nama,
        slug: _.kebabCase(nama),
        harga,
        kapasitasPeserta,
        description,
        methods,
        kategori,
        peserta,
        instruktur,
        materi: JSON.parse(materi),
        absensi,
        jadwal,
        kelasType,
        kodeNotaDinas,
        image: imageKelas,
        linkPelatihan: link,
        kategori,
        status,
      });

      const result = await kelas.save({ session });

      await session.commitTransaction();
      response(200, kelas, "Kelas berhasil di buat", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  updateKelasAdminSide: async (req, res) => {
    try {
      const id = req.params.id;
      const updated = req.body;
      const result = await KelasModel.findByIdAndUpdate(id, updated, {
        new: true,
      });

      response(200, result, "Kelas berhasil di update", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  updateKelasAdminSlug: async (req, res) => {
    try {
      const slug = req.params.slug;
      const updated = req.body;
      const result = await KelasModel.findOneAndUpdate(
        { slug: slug },
        updated,
        {
          new: true,
        }
      );

      response(200, result, "Kelas berhasil di update", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updateKelasWithND: async (req, res) => {
    try {
      const { nd, ...rest } = req.body;
      const result = await KelasModel.findOneAndUpdate(
        { kodeNotaDinas: nd },
        { $set: { ...rest } },
        {
          new: true,
        }
      );

      console.log(result);

      response(200, result, "Kelas berhasil di update", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updateKelasInstrukturSide: async (req, res) => {
    try {
      const id = req.params.id;
      const deskripsi = req.body.deskripsi;
      const materi = req.body.materi;

      const result = await KelasModel.findByIdAndUpdate(
        id,
        { materi: materi, description: deskripsi },
        { new: true }
      ); // $push: { materi: { $each: materi }

      response(200, result, "Kelas berhasil di update", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  deleteKelas: async (req, res) => {
    const id = req.params.id;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const checkKelas = await KelasModel.findOne({ _id: id }).session(session);
      if (checkKelas.peserta.length !== 0) {
        response(
          500,
          checkKelas,
          "Kelas ini sudah memiliki peserta , tidak bisa dihapus!",
          res
        );
        await session.abortTransaction();
        return;
      }
      const result = await KelasModel.findByIdAndDelete(id, { session });

      await session.commitTransaction();
      response(200, result, "Kelas berhasil di hapus", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  deactivatedKelas: async (req, res) => {
    // menonaktifkan kelas
    try {
      const id = req.params.id;
      const result = await KelasModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      response(200, result, "Kelas berhasil di nonaktifkan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  activateKelas: async (req, res) => {
    // menonaktifkan kelas
    try {
      const id = req.params.id;
      const result = await KelasModel.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true }
      );

      response(200, result, "Kelas berhasil di aktifkan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  enrolKelas: async (req, res) => {
    const slug = req.params.slug;
    const idUser = req.body.idUser;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const resultkelas = await KelasModel.findOne({ slug: slug }).session(
        session
      );
      const resultUser = await UserModel.findOne({ _id: idUser }).session(
        session
      );

      if (!resultkelas.peserta.includes(resultUser._id)) {
        if (
          (resultkelas.kelasType === 1 && resultUser.userType === 1) ||
          (resultkelas.kelasType === 0 &&
            (resultUser.userType === 1 || resultUser.userType === 0))
        ) {
          const extractedPesertaKelas = [...resultkelas.peserta];
          const extractedKelasUser = [...resultUser.kelas];

          extractedPesertaKelas.push({
            user: resultUser._id,
          });

          extractedKelasUser.push({
            kelas: resultkelas._id,
          });

          const resultEditKelas = await KelasModel.findOneAndUpdate(
            { slug: slug },
            { $set: { peserta: extractedPesertaKelas } },
            { new: true, session }
          );
          const resultEditUser = await UserModel.findOneAndUpdate(
            { _id: idUser },
            { $set: { kelas: extractedKelasUser } },
            { new: true, session }
          );

          await session.commitTransaction();
          session.endSession();

          response(200, resultkelas, "Berhasil enroll", res);
        } else {
          response(
            401,
            resultkelas,
            "Anda tidak bisa enroll untuk kelas ini (Status : Khusus Peserta Internal)",
            res
          );
          await session.abortTransaction();
          session.endSession();
        }
      } else {
        response(400, {}, "User sudah terdaftar di kelas", res);
        await session.abortTransaction();
        session.endSession();
      }
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },

  assignPesertaKelas: async (req, res) => {
    const slug = req.params.slug;
    const idUser = req.body.idUser;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const resultkelas = await KelasModel.findOne({ slug: slug }).session(
        session
      );
      const resultUser = await UserModel.findOne({ _id: idUser }).session(
        session
      );

      if (!resultkelas.peserta.includes(resultUser._id)) {
        if (
          (resultkelas.kelasType === 1 && resultUser.userType === 1) ||
          (resultkelas.kelasType === 0 &&
            (resultUser.userType === 1 || resultUser.userType === 0))
        ) {
          const extractedPesertaKelas = [...resultkelas.peserta];
          const extractedKelasUser = [...resultUser.kelas];

          extractedPesertaKelas.push({
            user: resultUser._id,
            status: "approved",
          });

          extractedKelasUser.push({
            kelas: resultkelas._id,
            status: "approved",
          });

          const resultEditKelas = await KelasModel.findOneAndUpdate(
            { slug: slug },
            { $set: { peserta: extractedPesertaKelas } },
            { new: true, session }
          );
          const resultEditUser = await UserModel.findOneAndUpdate(
            { _id: idUser },
            { $set: { kelas: extractedKelasUser } },
            { new: true, session }
          );

          await session.commitTransaction();
          session.endSession();

          response(200, resultkelas, "Berhasil ditambahkan", res);
        } else {
          response(
            401,
            resultkelas,
            "Peserta ini tidak bisa ditambahkan (Status Peserta: Eksternal)",
            res
          );
          await session.abortTransaction();
          session.endSession();
        }
      } else {
        response(400, {}, "Peserta sudah terdaftar di kelas", res);
        await session.abortTransaction();
        session.endSession();
      }
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },

  enrollmentKelas: async (req, res) => {
    try {
      const id = req.params.id;
      const idUser = req.body.idUser;
      const resultkelas = await KelasModel.findById(id);
      const resultUser = await UserModel.findById(idUser);
      //ngecek kalo kelas sudah penuh
      if (resultkelas.peserta.length < resultkelas.kapasitasPeserta) {
        //ngecek kalo user sudah terdaftar di kelas
        if (!resultkelas.peserta.includes(idUser)) {
          //ngecek kalo user internal atau eksternal
          if (resultkelas.kelasType === 1 && resultUser.userType === 1) {
            const calonPeserta = new calonPesertaSchema({
              kelas: id,
              idUser: idUser,
            });
            //masukin si user ke field calonPeserta di kelas
            resultkelas.calonPeserta.push(calonPeserta);
            const result = await resultkelas.save();
            response(
              200,
              result,
              "Berhasil enrol harap tunggu di setujui",
              res
            );
          } else if (resultkelas.kelasType === 0 && resultUser.userType === 0) {
            const calonPeserta = new calonPesertaSchema({
              kelas: id,
              idUser: idUser,
            });
            //masukin si user ke field calonPeserta di kelas
            resultkelas.calonPeserta.push(calonPeserta);
            const result = await resultkelas.save();
            response(
              200,
              result,
              "Berhasil enrol harap tunggu di setujui",
              res
            );
          } else if (resultkelas.kelasType === 0 || resultUser.userType === 1) {
            const calonPeserta = new calonPesertaSchema({
              kelas: id,
              idUser: idUser,
            });
            //masukin si user ke field calonPeserta di kelas
            resultkelas.calonPeserta.push(calonPeserta);
            const result = await resultkelas.save();
            response(
              200,
              result,
              "Berhasil enrol harap tunggu di setujui",
              res
            );
          } else {
            response(401, resultkelas, "tidak bisa enrol", res);
          }
        } else {
          response(400, idUser, "User sudah terdaftar di kelas", res);
        }
      } else {
        response(400, resultkelas, "Kelas sudah penuh", res);
      }
    } catch (error) {
      console.log(error.message);
      response(500, error, "Server error", res);
    }
  },

  approvePeserta: async (req, res) => {
    const { slug, iduser } = req.params;
    const { status } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const get = await KelasModel.findOne({ slug })
        .select("peserta")
        .session(session);

      const extracted = [...get.peserta];

      const selectPeserta = extracted.filter(
        (v) => v.user.toString() === iduser
      );
      const withoutSelected = extracted.filter(
        (v) => v.user.toString() !== iduser
      );

      selectPeserta[0].status = status;

      const mergePesertaList = [...withoutSelected, ...selectPeserta];

      await KelasModel.findOneAndUpdate(
        { slug },
        { $set: { peserta: mergePesertaList } },
        { new: true, session }
      );

      const getUser = await UserModel.findOne({ _id: iduser })
        .select("kelas")
        .session(session);

      const extractUser = [...getUser.kelas];

      const selectKelas = extractUser.filter(
        (v) => v.kelas.toString() === get._id.toString()
      );
      const withoutSelectedKelas = extractUser.filter(
        (v) => v.kelas.toString() !== get._id.toString()
      );

      selectKelas[0].status = status;

      const mergeKelasList = [...withoutSelectedKelas, ...selectKelas];

      const resp = await UserModel.findOneAndUpdate(
        { _id: iduser },
        { $set: { kelas: mergeKelasList } },
        { new: true, session }
      );

      await session.commitTransaction();

      response(200, resp, "Berhasil merubah status", res);
    } catch (error) {
      console.log(error.message);
      response(500, error, "Server error", res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  getMateriKelas: async (req, res) => {
    const { slug } = req.params;

    try {
      let kelas = await KelasModel.findOne({ slug: slug })
        .populate({
          path: "materi",
          populate: {
            path: "instruktur",
            model: "User",
            populate: {
              path: "rating",
              model: "rating",
            },
          },
        })
        .populate({
          path: "materi", // Populate the 'materi' array
          populate: {
            path: "items.tugas", // Populate the 'tugas' field within the 'materi' array
            model: "Tugas", // The Tugas model
          },
        })
        .populate({
          path: "materi",
          populate: {
            path: "test.pre test.post",
            model: "Test",
          },
        })
        .select("materi nama")
        .exec();

      if (!kelas) {
        response(404, id, "Materi tidak ditemukan", res);
      }

      response(200, kelas, "Materi ditemukan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getWithFilter: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);
      let totalData;

      if (isPaginate === 0) {
        const data = await KelasModel.find({ ...req.body })
          .populate("materi")
          .populate("kategori")
          .populate({
            path: "desainSertifikat.peserta",
            model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
          })
          .populate({
            path: "desainSertifikat.instruktur",
            model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
          });
        if (data) {
          totalData = data.length;
        }
        result = {
          data: data,
          "total data": totalData,
        };
        return response(200, result, "get kelas", res);
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const data = await KelasModel.find({ ...req.body })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("materi")
        .populate("kategori")
        .populate({
          path: "desainSertifikat.peserta",
          model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
        })
        .populate({
          path: "desainSertifikat.instruktur",
          model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
        });

      if (data) {
        totalData = data.length;
      }

      result = {
        data: data,
        "total data": totalData,
      };

      return response(200, result, "Berhasil get filtered kelas", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },

  getPesertaKelas: async (req, res) => {
    const { slug } = req.params;
    let totalData;
    const isPaginate = parseInt(req.query.paginate);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = parseInt(req.query.type);
    const status = req.query.status;

    try {
      const getKelas = await KelasModel.findOne({ slug });
      let pesertaIds = getKelas.peserta.map((v) => v.user);

      if (isPaginate === 0) {
        let peserta;

        peserta = await UserModel.find({ _id: { $in: pesertaIds } });
        if (type) {
          peserta = await UserModel.find({
            _id: { $in: pesertaIds },
            userType: type,
          });
        }
        const checkKelasHasSome = peserta.filter((pes) => {
          return pes.kelas.some((kelas) => kelas.status === status);
        });
        if (peserta) {
          totalData = peserta.length;
        }

        result = {
          data: checkKelasHasSome,
          total: totalData,
        };
        response(200, result, "get Peserta", res);
        return;
      }

      let peserta;

      peserta = await UserModel.find({ _id: { $in: pesertaIds } })
        .skip((page - 1) * limit)
        .limit(limit);

      if (type) {
        peserta = await UserModel.find({
          _id: { $in: pesertaIds },
          userType: type,
        })
          .skip((page - 1) * limit)
          .limit(limit);
      }
      // .populate("instruktur");

      let checkKelasHasSome;

      checkKelasHasSome = peserta;

      if (status) {
        checkKelasHasSome = peserta.filter((pes) => {
          return pes.kelas.some((kelas) => kelas.status === status);
        });
      }

      if (peserta) {
        totalData = peserta.length;
      }

      const result = {
        name: getKelas.nama,
        peserta: checkKelasHasSome,
        total: totalData,
        page: page,
        limit: limit,
      };

      response(200, result, "Data Peserta ditemukan", res);
    } catch (error) {
      response(500, error.message, error.message, res);
    }
  },

  kickPeserta: async (req, res) => {
    const { slug, id } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const getKelas = await KelasModel.findOne({ slug }).session(session);
      const getUser = await UserModel.findOne({ _id: id }).session(session);

      const kelasWithoutUser = getKelas.peserta.filter(
        (v) => v.user.toString() !== getUser._id.toString()
      );
      const updateKelas = await KelasModel.findOneAndUpdate(
        { slug },
        { $set: { peserta: kelasWithoutUser } },
        { new: true, session }
      );

      const userWithoutKelas = getUser.kelas.filter(
        (v) => v.kelas.toString() !== getKelas._id.toString()
      );
      const updateUser = await UserModel.findOneAndUpdate(
        { _id: id },
        { $set: { kelas: userWithoutKelas } },
        { new: true, session }
      );

      await session.commitTransaction();
      response(200, updateKelas, "Berhasil mengeluarkan user dari kelas", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  listKelasAbsenUser: async (req, res) => {
    const { iduser } = req.params;

    try {
      const get = await KelasModel.find({ "peserta.user": iduser })
        .populate("materi kategori")
        .populate({
          path: "materi.items.tugas",
          model: "Tugas",
        })
        .lean()
        .exec();
      response(200, get, "Kelas berhasil ditemukan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  getRecentClass: async (req, res) => {
    try {
      const data = await RecentClass.find({
        user: req.user.id,
      })
        .populate("kelas")
        .sort({ number: 1 });

      response(200, data, "Kelas terbaru berhasil ditemukan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  storeRecentClassIO: async ({ id, id_user }) => {
    try {
      const check = await RecentClass.findOne({
        user: id_user,
        $and: [
          {
            kelas: id,
          },
        ],
      });

      if (check) {
        const data = await RecentClass.find({
          user: id_user,
        })
          .populate("kelas")
          .sort({ number: 1 });

        return data;
      }

      const first = await RecentClass.findOne({
        number: 1,
        $and: [
          {
            user: id_user,
          },
        ],
      });

      const second = await RecentClass.findOne({
        number: 2,
        $and: [
          {
            user: id_user,
          },
        ],
      });

      const third = await RecentClass.findOne({
        number: 3,
        $and: [
          {
            user: id_user,
          },
        ],
      });

      const fourth = await RecentClass.findOne({
        number: 4,
        $and: [
          {
            user: id_user,
          },
        ],
      });

      if (first) {
        await RecentClass.findByIdAndUpdate(first._id, {
          number: 2,
        });
      }

      if (second) {
        await RecentClass.findByIdAndUpdate(second._id, {
          number: 3,
        });
      }

      if (third) {
        await RecentClass.findByIdAndUpdate(third._id, {
          number: 4,
        });
      }

      if (fourth) {
        await RecentClass.findByIdAndDelete(fourth._id);
      }

      await RecentClass.create({
        number: 1,
        kelas: id,
        user: id_user,
      });

      const data = await RecentClass.find({
        user: id_user,
      })
        .populate("kelas")
        .sort({ number: 1 });

      return data;
    } catch (error) {
      console.log(error);
    }
  },
};
