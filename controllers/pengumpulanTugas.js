const mongoose = require('mongoose');
const pengumpulanTugasSchema = require('../models/pengumpulanTugas');
const tugasSchema = require('../models/tugas');
const response = require('../respons/response');
const upload = require('../middleware/filepath');
const multer = require('multer');
const fileSystem = require('fs');
const { error } = require('console');

module.exports = {
    getPengumpulanTugas: async (req, res) => {//whit populate pagination
            try{
                const isPaginate = parseInt(req.query.paginate);
                if (isPaginate === 0) {
                    const totalData = await pengumpulanTugasSchema.countDocuments()
                    const data = await pengumpulanTugasSchema.find()
                    result = {data : data,"total data" : totalData
                    }         
                    response(200, result, "get Pengumpulan Tugas",res);
                    return;
                }
                const page =  parseInt(req.query.page) || 1;
                const limit =  parseInt(req.query.limit) || 10;
                const totalData = await pengumpulanTugasSchema.countDocuments() 

                const data = await pengumpulanTugasSchema.find()
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
    uploadPengumpulanTugas: async (req, res) => {
        const {answer} = req.body;
        const user = req.params.user;
        const idTugas = req.params.id;
        // const fileAnswer = req.file.path;
        try{
            // if (error instanceof multer.MulterError) {
            //     console.log(error.message);
            //     response(500, error, 'internal server error \n gagal menambahkan file pengumpulan tugas', res);
            // }else if(error){
            //     console.log(error.message);
            //     response(500, error, 'internal server error \n gagal menambahkan file pengumpulan tugas', res);
            // }else{
                const tugas = await tugasSchema.findById(idTugas);
                const today = new Date();
                let status = 'menunggu penilaian'
                if (tugas.dateFinished < today){
                    status = 'telat mengumpulkan'
                }

                const pengumpulanTugas = new pengumpulanTugasSchema({
                    user,
                    answer,
                    status : status
                });
                const newData = await pengumpulanTugas.save();

                const result = await tugasSchema.findByIdAndUpdate(idTugas,{pengumpulanTugas : newData}, {new:true})
                response(200, newData, "tugas berhasil di tambahkan",res)
            // }
        }catch(error){
            console.log(error.message);
            response(500, error, "Server error failed to add",res);
        }
    },
   
    deleteTugas: async (req, res) => {
        const id = req.params._id;
        try{
            const result = await pengumpulanTugasSchema.findByIdAndDelete(id);
            response(200, result, "tugas berhasil di hapus",res)
        }catch(error){
            console.log(error.message);
            response(500, error, "Server error failed to delete",res);
        }
    }
}
