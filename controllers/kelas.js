const mongoose = require('mongoose');
const KelasModel = require('../models/kelas');
const response = require('../respons/response');

module.exports = {
    getAllKelas: async (req, res) => { // make paginatiomm
        try {

            const halaman = parseInt(req.query.halaman) || 1;
            const batas = parseInt(req.query.batas) || 5;
            const totalData = await KelasModel.countDocuments();

            const data = await KelasModel.find()
            .skip((halaman - 1) * batas)
            .limit(batas)

            result = {
                data : data,
                "total data" : totalData
            }   

            response(200, result, 'berhasil Get all kelas',res)

        } catch (error) {
            response( 500,error, 'Server error',res)
        }
    },
    getOneKelas: async (req, res) => {

        const id = req.params.id;

        try{
            let kelas = await KelasModel.findById(id);

            if(!kelas){
                response(404, id, 'Kelas tidak ditemukan',res)
            }
            
            response(200, kelas, 'kelas ditemukan',res)
        }catch(error){
            response(500, error, 'Server error',res)
        }
    },
    createKelas: async (req, res) => {
        try {
            const {kodeKelas, nama,harga,kapasitasPeserta, description, methods ,instruktur, peserta} = req.body;
            
            const kelas = new KelasModel({
                kodeKelas,
                nama,
                harga,
                kapasitasPeserta,
                description,
                methods,
                peserta,
                instruktur
            });

            const result = await kelas.save();

            response(200, result, 'Kelas berhasil di buat',res)
        } catch (error) {
            response(500, error, 'Server error',res)
        }
    },
    updateKelas: async (req, res) => {
        try {

            const id = req.params.id;
            const updated = req.body;
            const result = await KelasModel.findByIdAndUpdate(id, updated,{new : true});

            response(200, result, 'Kelas berhasil di update',res)

        } catch (error) {
            response(500, error, 'Server error',res)
        }
    },
    deleteKelas: async (req, res) => {
        try{
            const id = req.params.id;
            const result = await KelasModel.findByIdAndDelete(id);

            response(200, result, 'Kelas berhasil di hapus',res)
        }catch(error){
            response(500, error, 'Server error',res)
        }
    },
    enrolKelas: async (req, res) => {
        try{
            const id = req.params.id;
            const result = await KelasModel.findById(id);

            if (result.kelasType === "All"){
                const resultKelas = await KelasModel.findByIdAndUpdate(id, {$push: {peserta: req.user._id}});
                const resultUser = await UserModel.findByIdAndUpdate(req.user._id, {$push: {kelas: id}});
                const result = {resultKelas, resultUser}
                response(200, result, 'User berhasil enrol kelas',res)
            }

            if(result.kelasType === req.user.userType){
                const resultKelas = await KelasModel.findByIdAndUpdate(id, {$push: {peserta: req.user._id}});
                const resultUser = await UserModel.findByIdAndUpdate(req.user._id, {$push: {kelas: id}});
                const result = {resultKelas, resultUser}
                response(200, result, 'User berhasil enrol kelas',res)
            }else{
                response(400, result, 'User tidak bisa enrol kelas',res)
            }
            
        }catch(error){
            response(500, error, 'Server error',res)
        }
    }
}
