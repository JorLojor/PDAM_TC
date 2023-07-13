const mongoose = require('mongoose');
const instrukturSchema = ('../models/instruktur');
const response = require('../respons/response');

module.exports = {
    getAllInstruktur:async (req, res) => {
        try{
           const isPaginate = req.query.isPaginate
           const page = parseInt(req.query.page) || 1;
           const limit = parseInt(req.query.limit) || 10;
            if (isPaginate === 0) {
                const results = await instrukturSchema.find();
                response(200,results,"whithout pagination",res)
            }
            const totalData = await instrukturSchema.find().countDocuments();
            const results = await instrukturSchema.find()
            .populate("intruktur")
            .skip((page - 1) * limit)
            .limit(limit)

            response(200,{totalData: totalData,result: results},"get whit pagination",res)
        }catch(error){
            response(550, error, 'Server error failed to get',res)
        }
    },
    getSingleInstruktur:async (req,res)=>{
        try{
            const id = req.params.id;
            const instruktur = await instrukturSchema.find(id)
            if (!instruktur){
                response(400, idUser, "User tidak ditemukan",res);
            }
            response(200, user, "Berhasil get single user",res);
        }catch(error){
            response(500,error,'server error failed to get')
        }
    },
    createInstruktur: async (req,res)=>{
        try{
            const {nama, email, nohp, spesialis} = req.body;
            const instruktur = new mongoose.Schema({
                nama,
                email,
                nohp,
                spesialis
            })
            const result = instruktur.save()
            response(200, result, 'created new instruktur',res)
        }catch(error){
            response(500,error,'server error failed to created')

        }
    },
    updateInstruktur: async (req, res)=>{
        const id = req.params.id;
        const update = req.body;
        try{
            const instruktur = await instrukturSchema.indByIdAndUpdate(id, update);
            response(200, instruktur, 'updated instruktur', res)
        }catch(error){
            response(500,error,'server error failed to update instruktur',res)
        }
    },
    deleteInstruktur: async (req, res)=>{
        const id = req.params.id
        try{
            const result = await instrukturSchema.findByIdAndDelete(id)
            response(200, result, 'instruktur deleted instruktur', res)
        }catch(error) {
            response(500,error,'server error failed to delete instruktur',res)
        }
    }
}
