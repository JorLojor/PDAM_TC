const mongoose = require('mongoose');
const tugasSchema = require('../models/tugas');

const response = require('../respons/response');
const upload = require('../middleware/filepath');
const uploadFile = require('../middleware/filepath');
const multer = require('multer');
require('dotenv').config();

module.exports = {
    getTugas: async (req, res) => {
        try{
            const isPaginate = parseInt(req.query.paginate);
            if (isPaginate === 0) {
                const totalData = await tugasSchema.countDocuments()
                const data = await tugasSchema.find()
                result = {data : data,"total data" : totalData
                }         
                response(200, result, "get user",res);
                return;
            }
            const page =  parseInt(req.query.page) || 1;
            const limit =  parseInt(req.query.limit) || 10;
            const totalData = await tugasSchema.countDocuments() 

            const data = await tugasSchema.find()
            .skip((page - 1) * limit)
            .limit(limit)
            

            const result = {data : data,"total data" : totalData}         

            response(200, result, "Berhasil get all tugas",res);   
        }catch(error){
            response(500, error, "Server error",res);
        }

    },
    creteTugas: async (req, res) => {
        try{
            const {description, dateStarted, dateFinished, tugasTexts, pengumpulanTugas} = req.body;

            const tugas = new tugasSchema({
                description,
                dateStarted,
                dateFinished,
                tugasTexts,
                pengumpulanTugas
            });
            const result = await tugas.save();
            response(200, result, "tugas berhasil di tambahkan",res)

        }catch(error){
            response(500, error.message, "Server error failed to add",res);
        }
    },
    pengumpulanTugas: async (req, res) => { // fungsi put yang di gunakan user saat mengumpulkan tugas
        try{
            
            const idTugas = req.params.id;
            const tugas = await tugasSchema.findById(idTugas);
            

            const user = req.body.user; //id user yang mengumpulkan tugas
            const answer = req.body.answer; //jawaban dari user
            const file = req.body.path; //file dari user untuk di kumpulkan
            

            const pengumpulan = {
                user,
                answer,
                file,
            };
            tugas.pengumpulanTugas.push(pengumpulan);
            response(200, tugas, "pengumpulan berhasil di tambahkan",res)

        }catch(error){
            console.log(error.message);
            response(500, error, "Server error",res);
        }
    },
    penilaian:async (req, res) => {
        try{
            const id = req.params._id;
            const idUser = req.body._idUser;
            const {nilai} = req.body;
            const resultPengumpulan = await tugasSchema.findByIdAndUpdate(id, { nilai });
            const resultUser = await UserModel.findById(idUser);
            let nilaiuser = resultUser.nilai;
            const nilaiAkhir = (nilaiuser + nilai);
            const resultFix = {resultPengumpulan, resultUser, nilaiAkhir}   
            response(200, resultFix, "tugas berhasil di update",res)

        }catch(error){
            response(500, error, "Server error failed to update",res);
        }
    },
    penilaianSecondary:async (req, res) => {
        try{
            const id = req.params._id;
            const idUser = req.body._idUser;
            const {nilai} = req.body;

            const session = await mongoose.startSession();
            session.startTransaction();

            const resultPengumpulan = await tugasSchema.findByIdAndUpdate(id, { nilai }, {session});

            const resultUser = await UserModel.findById(idUser);
            let nilaiuser = resultUser.nilai;
            const nilaiAkhir = (nilaiuser + nilai);
            const resultFix = {resultPengumpulan, resultUser, nilaiAkhir}

            await session.commitTransaction();
            session.endSession();
            response(200, resultFix, "tugas berhasil di update",res)

        }catch(error){
            response(500, error, "Server error failed to update",res);
        }finally{
            await session.endSession();
        }
    },
    // test
    updateTugas: async (req, res) => {
        const id = req.params.id;
        const update = req.body;
        try{
            const tugas = await tugas.findByIdAndUpdate(id, update,{new:true});
            response(200, tugas, "tugas berhasil di update",res)
        }catch(error){
            response(500, error, "Server error failed to update",res);
        }
    },
    deleteTugas: async (req, res) => {
        const id = req.params.id;
        try{
            const result = await tugas.findByIdAndDelete(id);
            response(200, result, "tugas berhasil di hapus",res)
        }catch(error){
            response(500, error, "Server error failed to delete",res);
        }
    },
}
