const mongoose = require('mongoose');
const tugasSchema = require('../models/tugas');

const response = require('../respons/response');
const upload = require('../middleware/filepath');
const uploadFile = require('../middleware/filepath');
const multer = require('multer');
// const storageRef = require('../middleware/firebaseConfig');
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
            const {description, dateStarted, dateFinished, fileText, pengumpulanTugas} = req.body;

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
