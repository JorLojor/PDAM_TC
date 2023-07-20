const mongoose = require('mongoose');
const KelasModel = require('../models/kelas');
const response = require('../respons/response');

module.exports = {
    getAllKelas: async (req, res) => { // make paginatiomm
        try {
            const halaman = parseInt(req.query.halaman) || 1;
            const batas = parseInt(req.query.batas) || 5;
            let totalData;

            totalData = await KelasModel.countDocuments();
            const result = await KelasModel.find()
            .skip((halaman - 1) * batas)
            .limit(batas)
            response(200, result, {totalData, halaman, batas}, 'Get all kelas success',res)
        } catch (error) {
            response( 500,error, 'Server error',res)
        }
    },
    getOneKelas: async (req, res) => {
        const id = req.params.id;
        try{
            let kelas = await KelasModel.findById(id);
            if(!kelas){
                response(404, id, 'Kelas not found',res)
            }
            response(200, kelas, 'kelas di dapat',res)
        }catch(error){
            response(500, error, 'Server error',res)
        }
    },
    createKelas: async (req, res) => {
        try {
            const {kodeKelas, nama,harga,kapasitasPeserta, deskription, methods ,instruktur} = req.body;
            const kelas = new KelasModel({
                kodeKelas,
                nama,
                harga,
                kapasitasPeserta,
                deskription,
                methods,
                instruktur,
            });
            const result = await kelas.save();
            response(200, result, 'Kelas berhasil di buat',res)
        } catch (error) {
            response(500, error, 'Server error',res)
        }
    },
    updateKelasAdminSide: async (req, res) => {
        try {
            const id = req.params.id;
            const updated = req.body;
            const result = await KelasModel.findByIdAndUpdate(id, updated);
            response(200, result, 'Kelas berhasil di update',res)
        } catch (error) {
            response(500, error, 'Server error',res)
        }
    },
    updateKelasInstrukturSide : async (req, res) => {
        try {
            const id = req.params.id;
            const deskripsi = req.body.deskripsi;
            const materi = req.body.materi;

            const data = await KelasModel.findById(id);
            let materiResult = data.materi;
            if (materi !== null && materi !== undefined && materi !== "") {
                data.materi.push(materi);
                materiResult = data.materi;
                console.log("test");
            }

            const result = await KelasModel.findByIdAndUpdate(id, {materi : materiResult, description : deskripsi } , {new : true})// $push: { materi: { $each: materi } 
            console.log(result)
            response(200, result, 'Kelas berhasil di update',res)
        }catch (error){
            console.log(error.messsage)
            response(500, error, 'Server error',res)
        }
    },
    deleteKelas: async (req, res) => {
        try{
            const id = req.params.id;
            const result = await KelasModel.findByIdAndDelete(id);
        }catch(error){
            response(500, error, 'Server error',res)
        }
    },
}
