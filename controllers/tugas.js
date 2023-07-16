const mongoose = require('mongoose');
const tugasSchema = require('../models/tugas');

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
            .populate("kelas")

            result = {data : data,"total data" : totalData}         

            response(200, result, "Berhasil get all user",res);   
        }catch(error){
            response(500, error, "Server error",res);
        }

    },
    createTugas: async (req, res) => {
        const {description, dateStarted, dateFinished,fileTugas,pengumpulanTugas} = req.body;
        try{
            const tugas = await tugasSchema.create({
                description,
                dateStarted,
                dateFinished,
                fileTugas,
                pengumpulanTugas
            });
            const result = await tugas.save();
            response(200, result, "tugas berhasil di buat",res)
        }catch(error){
            response(500, error, "Server error failed to create",res);
        }
    },
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
