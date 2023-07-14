const mongoose = require('mongoose');
const pesertaKelasSchema = require('../models/pesertaKelas');
const response = require('../respons/response');

module.exports = {
    getAllPeserta: async (req, res) => {
        try{
            const halaman = parseInt(req.query.halaman) || 1;
            const batas = parseInt(req.query.batas) || 10;

            let totalData = await pesertaKelasSchema.countDocuments();
            const results = await pesertaKelasSchema.find()
            .skip((halaman - 1) * batas)
            .limit(totalData)
            response(200,results,'get data peserta',res)
        }catch(error){
            response( 500,error, 'Server error',res)
        }
    },
    getOnePeserta: async (req, res) => {
        const id = req.params.id
        try{
            const result = await pesertaKelasSchema.findById(id)
            response(200,result,'get data peserta',res)
        }catch(error){
            response( 500,error, 'Server error',res)
        }
    },
    createPeserta: async (req, res) => {
        try{
            const {idUser, status} = req.body // id user adalah user yang mengikuti kelas nya
            const peserta = new pesertaKelasSchema({
                idUser,
                status
            })
            const result = await peserta.save()
            response(200,result,'create peserta',res)
        }catch(error){
            response( 500,error, 'Server error',res)
        }
    },
    updatePeserta: async (req, res) => {
        try{
            const id = req.params.id;
            const update = req.body;

            const result = await pesertaKelasSchema.findByIdAndUpdate(id, update);
            response(200,result,'update peserta',res);
        }catch(error){
            response( 500,error, 'Server error',res);
        }
    },
    deletePeserta: async (req, res) => {
        try{
            const id = req.params.id;
            const result = await pesertaKelasSchema.findByIdAndDelete(id);
            response(200,result,'delete peserta',res);
        }catch(error){
            response( 500,error, 'Server error',res);
        }
    },
}
