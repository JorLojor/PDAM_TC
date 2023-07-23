const mongoose = require('mongoose');
const tugasSchema = require('../models/pengumpulanTugas');
const UserModel = require('../models/user');


const response = require('../respons/response');
const upload = require('../middleware/filepath');
const multer = require('multer');
const fileSystem = require('fs')

module.exports = {
    getpTugas: async (req, res) => {//whit populate pagination
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
                .populate("user file")

                result = {data : data,"total data" : totalData}         

                response(200, result, "Berhasil get all user",res);
        }catch(error){
            console.log(error.message);
            response(500, error, "Server error",res);
        }
    },
    createTugas: async (req, res) => {//ngumpulin tugas
        upload(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
              response(500, error, 'internal server error \n gagal menambahkan file pengumpulan tugas', res);
            }else if(error){
              response(500, error, 'internal server error \n gagal menambahkan file pengumpulan tugas', res);
            }else{
                try{
                    const {user,textAnswer,file} = req.body;
                    const fileAnswer = req.file.path;

                    const pengumpulanTugas = new pengumpulanTugasSchema({
                        user,
                        file,
                        textAnswer,
                        fileAnswer
                    });
                    const result = await pengumpulanTugas.save();
                    response(200, result, "tugas berhasil di tambahkan",res)
                }catch(error){
                    response(500, error, "Server error failed to add",res);
                }
            }
        });
    },
    updateTugas: async (req, res) => {
        try{
            const id = req.params._id;
            const {description, dateStarted, dateFinished} = req.body;
            let newFile;
            if(req.file){
                const oldFile = await tugasSchema.findById(id);
                if (oldFile.fileTugas) {
                    fileSystem.unlinkSync(oldFile.newFile);
                }
                newFile = req.file.path;
            }
            
            const result = await tugasSchema.findByIdAndUpdate(id, {
                description, 
                dateStarted, 
                dateFinished, 
                newFile
            });
            response(200, result, "tugas berhasil di update",res)
        }catch(error){
            response(500, error, "Server error failed to update",res);
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
    deleteTugas: async (req, res) => {
        const id = req.params._id;
        try{
            const result = await tugasSchema.findByIdAndDelete(id);
            response(200, result, "tugas berhasil di hapus",res)
        }catch(error){
            response(500, error, "Server error failed to delete",res);
        }
    },
}
