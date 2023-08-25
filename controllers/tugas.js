const mongoose = require("mongoose");
const tugasSchema = require("../models/tugas");
const userModel = require("../models/user");
const KelasModel = require("../models/kelas");
const MateriModel = require('../models/materi')
const response = require("../respons/response");
const upload = require("../middleware/filepath");
const uploadFile = require("../middleware/filepath");
const multer = require("multer");
require("dotenv").config();

module.exports = {
  getTugas: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);
      if (isPaginate === 0) {
        const totalData = await tugasSchema.countDocuments();
        const data = await tugasSchema.find();
        result = { data: data, "total data": totalData };
        response(200, result, "get user", res);
        return;
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const totalData = await tugasSchema.countDocuments();

      const data = await tugasSchema
        .find()
        .skip((page - 1) * limit)
        .limit(limit);

      const result = { data: data, "total data": totalData };

      response(200, result, "Berhasil get all tugas", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },
  getOnetugas:async(req,res)=>{
    const {id} = req.params;

    try {
      const get = await tugasSchema.findOne({_id:id}).populate('kelas pengumpulanTugas.user')
      response(200,get,'Ditemukan',res)
    } catch (error) {
      response(500,null,error.message,res)      
    }
  },
  getTugasFiltered:async(req,res)=>{
    try {
      const get = await tugasSchema.find({...req.body}).populate('kelas')
      response(200,get,'Tugas ditemukan',res)
    } catch (error) {
      response(500,error,error.message,res)
    }
  },
  checkPesertaStatus:async(req,res)=>{
    const {id,idTugas} = req.params;

    try {
      const checkTugas = await tugasSchema.findOne({_id:idTugas})
      const pengumpulanTugas = checkTugas.pengumpulanTugas

      const checkUserInsideTugas = pengumpulanTugas.filter((tugas)=> tugas.user.toString() === id)
      
      if (checkUserInsideTugas.length === 0) {
        res.json({status:'Belum Mengumpulkan'})
        return;
      }

      res.json({status:checkUserInsideTugas[0].status})
    } catch (error) {
      res.json({status:'Error!'})
      console.log(error.message);
    }
  },
  getAllTugasInstruktur: async (req, res) => {
    const { id } = req.params;

    try {
      const tugasList = await MateriModel.find({ instruktur: id }).populate('items.tugas').select('section items.title items.tugas');
      response(200, tugasList, "Ditemukan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },
  creteTugas: async (req, res) => {
    try {
      uploadFile.single("attachment")(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: "File upload error" });
        } else if (err) {
          return res.status(500).json({ error: "Something went wrong" });
        }
        const { title, instruction, deadline, materi, kelas } = req.body;
        const attachment = req.file.path;
        const tugas = new tugasSchema({
          title,
          instruction,
          deadline,
          attachment,
          kelas,
          materi,
        });
        const result = await tugas.save();
        response(200, result, "tugas berhasil di tambahkan", res);
      });
    } catch (error) {
      response(500, error.message, "Server error failed to add", res);
    }
  },
  pengumpulanTugas: async (req, res) => {
    // fungsi put yang di gunakan user saat mengumpulkan tugas
    try {
        const idTugas = req.params.id;
        const user = req.body.user; //id user yang mengumpulkan tugas
        // const answerFile = req.file.path; //jawaban dari user
        const answer = req.body.answer; //jawaban dalam bentuk text

        let answerFile = null;

        if (req.file) {
          answerFile = req.file.path.split("/PDAM_TC/")[1];
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
        const today = new Date();
        let status = "menunggu";

        if (tugas.deadline < today) {
          status = "telat";
        }

        const pengumpulan = {
          user,
          answerFile,
          answer,
          status: status,
        };
        let data = tugas.pengumpulanTugas;
        data.push(pengumpulan);

        const result = await tugasSchema.findByIdAndUpdate(
          idTugas,
          { pengumpulanTugas: data },
          { new: true }
        );
        response(200, result, "pengumpulan berhasil di tambahkan", res);
    } catch (error) {
      response(500, error,error.message, res);
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

      const getTugas = await tugasSchema.findOne({_id:id}).session(session)
      if (!getTugas) {
        response(404,getTugas,'Tidak ada Tugas yang dimaksud!',res)
        return;
      }
      const boxTugas = getTugas.pengumpulanTugas

      const checkUserInsideBox = boxTugas.filter((item)=>item.user.toString() === idUser)
      const withoutUserInsideBox = boxTugas.filter((item)=>item.user.toString() !== idUser)

      if (checkUserInsideBox.length === 0) {
        response(404,checkUserInsideBox,'Tidak ada User yang dimaksud!',res)
        return;
      }

      const mappedTugas = checkUserInsideBox.map((v)=>{
        return {
          ...v._doc,
          nilai:nilai
        }
      })

      const combinedBox = [...withoutUserInsideBox,...mappedTugas]

      const updateTugas = await tugasSchema.findOneAndUpdate({_id:id},{$set:{pengumpulanTugas:combinedBox}},{new:true,session})

      await session.commitTransaction();
      response(200, updateTugas, "tugas berhasil di update", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction()
    } finally {
      session.endSession();
    }
  },
  // test
  updateTugas: async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      const tugas = await tugasSchema.findByIdAndUpdate(id, update, {
        new: true,
      });
      response(200, tugas, "tugas berhasil di update", res);
    } catch (error) {
      response(500, error, "Server error failed to update", res);
    }
  },
  deleteTugas: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await tugasSchema.findByIdAndDelete(id);
      response(200, result, "tugas berhasil di hapus", res);
    } catch (error) {
      response(500, error, "Server error failed to delete", res);
    }
  },
};
