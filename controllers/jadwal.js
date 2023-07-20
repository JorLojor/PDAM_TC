const mongoose = require("mongoose");
const jadwalModel = require('../models/jadwal')
const response = require('../respons/response')

module.exports = {
    getJadwal: async (req,res) => {
        // get all whihout pagination
        try{
            const jadwal = await jadwalModel.find()
            response(200, jadwal, "get all jadwal",res)
        }catch(error){
            response(500, error, "Server error failed to get",res);
        }
    },
    createJadwal: async (req,res) => {
        try{
            const {kelas, jamMulai, jamSelesai, tanggal} = req.body;
            const jadwal = new jadwalModel({
                kelas,
                jamMulai,
                jamSelesai,
                tanggal,
            })
            const result = await jadwal.save();
            response(200, result, "created new jadwal",res)
        }catch(error){
            response(500, error, "Server error failed to create",res);
        }
    },
    updateJadwal: async (req,res) => {
        const id = req.params.id;
        const update = req.body;
        try{
            const jadwal = await jadwalModel.findByIdAndUpdate(id, update,{new:true});
            response(200, jadwal, "jadwal berhasil di update",res)
        }catch(error){
            response(500, error, "Server error failed to update",res);
        }
    },
    deleteJadwal: async (req,res) => {
        const id = req.params.id;
        try{
            const result = await jadwalModel.findByIdAndDelete(id);
            response(200, result, "jadwal berhasil di hapus",res)
        }catch(error){
            response(500, error, "Server error failed to delete",res);
        }
    }
}
