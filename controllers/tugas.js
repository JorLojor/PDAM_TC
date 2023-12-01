const mongoose = require("mongoose");
const tugasSchema = require("../models/tugas");
const userModel = require("../models/user");
const KelasModel = require("../models/kelas");
const MateriModel = require("../models/materi");
const response = require("../respons/response");
const upload = require("../middleware/filepath");
const TaskDeadline = require("../models/tugasDeadline");
const uploadFile = require("../middleware/filepath");
const multer = require("multer");
require("dotenv").config();

module.exports = {
  getTugas: async (req, res) => {
    try {
      const slug = req.params.slug;

      let materi = await MateriModel.findOne({ slug });

      if (!materi) {
        return response(400, null, "Materi tidak ditemukan", res);
      }

      task = await tugasSchema
        .find({
          materi: materi._id,
        })
        .populate("materi", "section");

      if (!task) {
        return response(400, null, "Tugas tidak ditemukan", res);
      }

      return response(200, task, "berhasil get tugas", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  getOnetugas: async (req, res) => {
    const { id } = req.params;

    try {
      const get = await tugasSchema
        .findOne({ _id: id })
        .populate("materi pengumpulanTugas.user");
      response(200, get, "Ditemukan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  getTugasFiltered: async (req, res) => {
    try {
      const get = await tugasSchema.find({ ...req.body }).populate("materi");
      response(200, get, "Tugas ditemukan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getTugasDeadline: async (req, res) => {
    try {
      const { id, task, kelas } = req.params;

      const findKelas = await KelasModel.findOne({ slug: kelas });

      if (!findKelas) {
        return response(404, {}, "kelas tidak ditemukan", res);
      }

      const get = await TaskDeadline.find({
        user: id,
        task,
        class: findKelas._id,
      }).populate("task");
      console.log(get);
      response(200, get, "Tugas ditemukan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  setTugasDeadline: async (req, res) => {
    try {
      const { task, kelas } = req.body;
      const currentTime = new Date();

      const checkTugas = await tugasSchema.findOne({ _id: task });

      if (!checkTugas) {
        return response(404, {}, "tugas tidak ditemukan", res);
      }

      const checkKelas = await KelasModel.findOne({ slug: kelas });

      if (!checkKelas) {
        return response(404, {}, "kelas tidak ditemukan", res);
      }

      const data = await TaskDeadline.create({
        user: req.user.id,
        task,
        class: checkKelas._id,
        deadline: new Date(
          currentTime.getTime() + checkTugas.timeLimit * 24 * 60 * 60 * 1000
        ),
      });

      const findTugas = await tugasSchema.findOne({ _id: task });

      findTugas.deadline = data.deadline;

      return response(201, findTugas, "deadline berhasil ditambahkan", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },

  checkPesertaStatus: async (req, res) => {
    const { id, idTugas } = req.params;

    try {
      const checkTugas = await tugasSchema.findOne({ _id: idTugas });
      const pengumpulanTugas = checkTugas.pengumpulanTugas;

      const checkUserInsideTugas = pengumpulanTugas.filter(
        (tugas) => tugas.user.toString() === id
      );

      if (checkUserInsideTugas.length === 0) {
        res.json({ status: "Belum Mengumpulkan" });
        return;
      }

      res.json({ status: checkUserInsideTugas[0].status });
    } catch (error) {
      res.json({ status: "Error!" });
      console.log(error.message);
    }
  },

  getAllTugasInstrukturPersonal: async (req, res) => {
    try {
      let data = [];
      let task = [];

      const materis = await MateriModel.find({ instruktur: req.user.id });

      if (materis.length > 0) {
        await Promise.all(
          materis.map(async (materi) => {
            const tasks = await tugasSchema
              .find({
                materi: materi._id,
              })
              .populate("materi");

            if (tasks.length > 0) {
              tasks.map((t) => {
                task.push(t._id);
              });
            }

            if (task.length > 0) {
              task.map(async (t) => {
                const deadline = await TaskDeadline.findOne({
                  task: t,
                }).populate("task");

                if (deadline) {
                  data.push(deadline);
                }
              });
            }
          })
        );
      }

      return response(200, data, "Ditemukan", res);
    } catch (error) {
      return response(500, null, error.message, res);
    }
  },

  getAllTugasInstruktur: async (req, res) => {
    const { id } = req.params;

    try {
      let data = [];

      const materis = await MateriModel.find({ instruktur: id });

      if (materis.length > 0) {
        await Promise.all(
          materis.map(async (materi) => {
            const tasks = await tugasSchema
              .find({
                materi: materi._id,
              })
              .populate("materi");

            if (tasks.length > 0) {
              tasks.map((task) => {
                data.push({
                  task,
                });
              });
            }
          })
        );
      }

      return response(200, data, "Ditemukan", res);
    } catch (error) {
      return response(500, null, error.message, res);
    }
  },

  store: async (req, res) => {
    try {
      const { title, instruction, deadline, materi } = req.body;

      let attachment = "";

      const materiData = await MateriModel.findOne({ slug: materi });

      if (!materiData) {
        response(500, null, "Materi tidak ditemukan", res);
      }

      if (req.file) {
        attachment = "/upload/" + req.file.path.split("/upload/").pop();
      }

      const tugas = tugasSchema.create({
        title,
        instruction,
        timeLimit: parseInt(deadline),
        attachment,
        materi: materiData._id,
      });

      await MateriModel.findByIdAndUpdate(
        materiData._id,
        {
          $push: {
            "items.tugas": tugas._id,
          },
        },
        { new: true }
      );

      response(200, tugas, "tugas berhasil di tambahkan", res);
    } catch (error) {
      response(500, error.message, "Server error failed to add", res);
    }
  },

  pengumpulanTugas: async (req, res) => {
    // fungsi put yang di gunakan user saat mengumpulkan tugas
    try {
      const idTugas = req.params.id;
      const user = req.body.user; //id user yang mengumpulkan tugas
      const answer = req.body.answer; //jawaban dalam bentuk text
      const kelas = req.body.kelas; //kelas dalam bentuk slug

      let answerFile = null;

      if (req.file) {
        answerFile = "/upload/" + req.file.path.split("/upload/").pop();
      }

      const tugas = await tugasSchema.findById(idTugas);
      let cekUser = false;

      tugas.pengumpulanTugas.forEach((e) => {
        if (user == e.user) {
          cekUser = true;
        }
      });

      if (cekUser) {
        response(400, user, "anda sudah mengumpulkan", res);
      }

      const checkKelas = await KelasModel.findOne({ slug: kelas });

      if (!checkKelas) {
        return response(404, {}, "kelas tidak ditemukan", res);
      }

      const today = new Date();
      let status = "menunggu";

      if (tugas.deadline < today) {
        status = "telat";
      }

      const pengumpulan = {
        user,
        kelas: checkKelas.slug,
        answerFile,
        answer,
        status: status,
      };

      console.log({ pengumpulan });

      let data = tugas.pengumpulanTugas;

      data.push(pengumpulan);

      console.log({ data });

      const result = await tugasSchema.findByIdAndUpdate(
        idTugas,
        { pengumpulanTugas: data },
        { new: true }
      );
      response(200, result, "pengumpulan berhasil di tambahkan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updatePengumpulanTugas1: async (req, res) => {
    try {
      uploadFile.single("answerFile")(req, res, async function (err) {
        const id = req.params._id;
        const idUser = req.body.user;
        const { answer } = req.body;
        const { answerFile } = req.file.path;
        if (err instanceof multer.MulterError) {
          console.log(err.message);
          response(
            500,
            err,
            "internal server error \n gagal menambahkan file pengumpulan tugas",
            res
          );
        } else if (err) {
          console.log(err.message);
          response(
            500,
            err,
            "internal server error \n gagal menambahkan file pengumpulan tugas",
            res
          );
        } else {
          const tugas = await tugasSchema.findById(id);
          const today = new Date();
          let status = "menunggu penilaian";
          if (tugas.deadline < today && tugas.deadline + 1 < today) {
            status = "telat mengumpulkan";
            data.status = status;
          }
          const pengumpulan = {
            idUser,
            answer,
            answerFile,
            status: status,
          };
          response(200, result, "tugas berhasil di update", res);
        }
      });
    } catch (error) {
      console.log(error.message);
      response(500, error, "Server error failed to update", res);
    }
  },

  updatePengumpulanTugas: async (req, res) => {
    try {
      uploadFile.single("answerFile")(req, res, async function (err) {
        const id = req.params.id;
        const { answer, user } = req.body;
        if (err instanceof multer.MulterError) {
          console.log(err.message);
          response(
            500,
            err,
            "internal server error \n gagal menambahkan file pengumpulan tugas",
            res
          );
        } else if (err) {
          console.log(err.message);
          response(
            500,
            err,
            "internal server error \n gagal menambahkan file pengumpulan tugas",
            res
          );
        } else {
          const answerFile = req.file.path;
          const tugas = await tugasSchema.findById(id);
          const today = new Date();

          const filter = tugas.pengumpulanTugas;
          const index = filter.findIndex((v) => {
            return v.user == user;
          });
          let status = "menunggu penilaian";
          if (tugas.pengumpulanTugas[index].dateSubmitted < today) {
            status = "telat mengumpulkan";
          }

          const data = {
            user,
            answer,
            status: status,
            answerFile: answerFile,
          };
          tugas.pengumpulanTugas[index] = data;

          const newData = tugas.pengumpulanTugas;
          const result = await tugasSchema.findByIdAndUpdate(
            id,
            { pengumpulanTugas: newData },
            { new: true }
          );
          response(200, result, "tugas berhasil di update", res);
        }
      });
    } catch (error) {
      console.log(error.message);
      response(500, error, "Server error failed to update", res);
    }
  },

  penilaianTesting: async (req, res) => {
    try {
      const id = req.params._id;
      const idUser = req.body._idUser;
      const { nilai } = req.body;
      const resultPengumpulan = await tugasSchema.findByIdAndUpdate(id, {
        nilai,
      });
      const resultUser = await userModel.findById(idUser);
      let nilaiuser = resultUser.nilai;
      const nilaiAkhir = nilaiuser + nilai;
      const resultFix = { resultPengumpulan, resultUser, nilaiAkhir };
      response(200, resultFix, "tugas berhasil di update", res);
    } catch (error) {
      response(500, error, "Server error failed to update", res);
    }
  },

  penilaian: async (req, res) => {
    const id = req.params.id;
    const idUser = req.body.idUser;
    const { nilai } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      //Find tugas yang memiliki ID yang sama
      //Ambil pengumpulanTugas
      //Cari pengumpulanTugas mana yang punya nilai user idUser
      //Ubah / Tambahkan nilai user kedalam item pengumpulanTugas
      //Update nilai pengumpulanTugas tugas

      const getTugas = await tugasSchema.findOne({ _id: id }).session(session);
      if (!getTugas) {
        response(404, getTugas, "Tidak ada Tugas yang dimaksud!", res);
        return;
      }
      const boxTugas = getTugas.pengumpulanTugas;

      console.log({ boxTugas });
      console.log({ idUser });

      const checkUserInsideBox = boxTugas.filter(
        (item) => item.user.toString() === idUser._id.toString()
      );
      const withoutUserInsideBox = boxTugas.filter(
        (item) => item.user.toString() !== idUser._id.toString()
      );

      if (checkUserInsideBox.length === 0) {
        response(404, checkUserInsideBox, "Tidak ada User yang dimaksud!", res);
        return;
      }

      const mappedTugas = checkUserInsideBox.map((v) => {
        return {
          ...v._doc,
          nilai: nilai,
          status: "sudah dinilai",
        };
      });

      const combinedBox = [...withoutUserInsideBox, ...mappedTugas];

      const updateTugas = await tugasSchema.findOneAndUpdate(
        { _id: id },
        { $set: { pengumpulanTugas: combinedBox } },
        { new: true, session }
      );

      await session.commitTransaction();
      response(200, updateTugas, "tugas berhasil di update", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },
  // test
  updateTugas: async (req, res) => {
    const id = req.params.id;

    let attachment = "";

    const { title, instruction, deadline } = req.body;

    if (req.file) {
      attachment = "/upload/" + req.file.path.split("/upload/").pop();
    }

    const getTugas = await tugasSchema.findById(id);

    try {
      const tugas = await tugasSchema.findByIdAndUpdate(
        id,
        {
          title,
          instruction,
          deadline,
          attachment: attachment ? attachment : getTugas.attachment,
        },
        {
          new: true,
        }
      );

      response(200, tugas, "tugas berhasil di update", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  deleteTugas: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const id = req.params.id;
    try {
      const result = await tugasSchema.findByIdAndDelete(id).session(session);
      const materi = await MateriModel.findOneAndUpdate(
        { "items.tugas": id },
        { $pull: { "items.tugas": id } },
        { new: true, session }
      );

      await session.commitTransaction();
      response(200, result, "tugas berhasil di hapus", res);
    } catch (error) {
      response(500, error, "Server error failed to delete", res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  getMateriTugas: async (req, res) => {
    const { id } = req.params;
    try {
      const get = await tugasSchema.find({ materi: id }).populate("materi");
      response(200, get, "Tugas ditemukan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
};
