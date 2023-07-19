const mongoose = require('mongoose');
const tugasSchema = require('../models/tugas');

const response = require('../respons/response');
const upload = require('../middleware/filepath');
const multer = require('multer');

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
            console.log(error.message);
            response(500, error, "Server error",res);
        }


    },
    createTugas: async (req, res) => {
        upload(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
                console.log(error.message);
              response(500, error, 'internal server error \n gagal menambahkan file', res);
            } else if (error) {
                console.log(error.message);
              response(500, error, 'internal server error \n gagal menambahkan file', res);
            }else{
                try{ 
                    const {description, dateStarted, dateFinished} = req.body;
                    const fileTugas = req.file.path;

                    const tugas = new tugasSchema({
                        description, 
                        dateStarted, 
                        dateFinished, 
                        fileTugas
                    });
                    const result = await tugas.save();
                    response(200, result, "tugas berhasil di tambahkan",res)
                }catch(error){
                    response(500, error, "Server error failed to add",res);
                }
            }
        });
    
        
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
