const mongoose = require('mongoose');
const KelasModel = require('../models/kelas');
const UserModel = require('../models/user');
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
            .populate('materi instruktur peserta') // ini untuk uji 

            result = {
                data : data,
                "total data" : totalData
            }   

            response(200, result, 'berhasil Get all kelas',res)

        } catch (error) {
            response( 500,error, 'Server error',res)
        }
    },
    nilaiPerKelas: async (req, res) => {
        const kelasId = req.params.id;
        try {
            const kelas = await KelasModel.findById(kelasId).populate('materi');
            if (!kelas) {
                return response(404, null, 'Kelas tidak ditemukan', res);
            }
    
            const nilaiPermateri = kelas.materi.map((materi) => materi.nilaiPermateri);
            const totalNilai = nilaiPermateri.reduce((acc, curr) => acc + curr, 0);
            const rataRata = totalNilai / nilaiPermateri.length;
    
            kelas.nilaiperkelas = rataRata;
            await kelas.save();
    
            response(200, kelas, 'Nilai rata-rata kelas berhasil di update', res);
        } catch (error) {
            console.log(error.message);
            response(500, error, 'Server error', res);
        }
    },
    
    getOneKelas: async (req, res) => {

        const id = req.params.id;

        try{
            let kelas = await KelasModel.findById(id)
            .populate('materi instruktur peserta');


            if(!kelas){
                response(404, id, 'Kelas tidak ditemukan',res)
            }
            
            response(200, kelas, 'kelas ditemukan',res)
        }catch(error){
            console.log(error.message);
            response(500, error, 'Server error',res)
        }
    },
    createKelas: async (req, res) => {
        try {
            const {kodeKelas, nama,harga,kapasitasPeserta, description, methods ,instruktur, peserta,materi} = req.body;
            
            const kelas = new KelasModel({
                kodeKelas,
                nama,
                harga,
                kapasitasPeserta,
                description,
                methods,
                peserta,
                instruktur,
                materi
            });

            const result = await kelas.save();

            response(200, result, 'Kelas berhasil di buat',res)
        } catch (error) {
            response(500, error, 'Server error',res)
        }
    },
    createKelasTest: async (req, res) => {
        try {
            const {kodeKelas, nama,harga,kapasitasPeserta, description, methods ,instruktur, peserta,materi,kelasType,kodeNotaDinas} = req.body;
            
            const kelas = new KelasModel({
                kodeKelas,
                nama,
                harga,
                kapasitasPeserta,
                description,
                methods,
                peserta,
                instruktur,
                materi,
                kelasType,
                kodeNotaDinas
            });

            const result = await kelas.save();

            response(200, result, 'Kelas berhasil di buat',res)
        } catch (error) {
            console.log(error.message);
            response(500, error, 'Server error',res)
        }
    },
    updateKelasAdminSide: async (req, res) => {
        try {

            const id = req.params.id;
            const updated = req.body;
            const result = await KelasModel.findByIdAndUpdate(id, updated,{new : true});

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
            const result = await KelasModel.findByIdAndUpdate(id, {$push: {materi: materi}, description: deskripsi},{new : true});
            console.log(result)
            response(200, result, 'Kelas berhasil di update',res)
        }catch (error){
            console.log(error.messsage)
            response(500, error, 'Server error',res)
        }
    },
    updateNilaiRataRataKelas: async (req, res) => {},
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
        try {
          const id = req.params.id;
          const idUser = req.body.idUser;
          const resultkelas = await KelasModel.findById(id);
          const resultUser = await UserModel.findById(idUser);
      
          if (!resultkelas.peserta.find(peserta => peserta.user.toString() === idUser)) {
            const newPeserta = { user: idUser, status: 'pending' }; 
            
            //ngecek kelas udh penuh apa belom
        if (resultkelas.peserta.length >= resultkelas.kapasitasPeserta) {
            response(400, {}, 'Kelas sudah penuh', res);
        } else {
            //pengondisian userType dan kelasType = 1 untuk internal dan 0 untuk eksternal
            if(resultkelas.kelasType === 1 && resultUser.userType === 1){
                newPeserta.status = 'approved as internal class';
                resultkelas.peserta.push(newPeserta);
                resultkelas.save();
                response(200, resultkelas, 'User berhasil di enroll', res);
            }else if(resultkelas.kelasType === 0 || resultUser.userType === 0){
                newPeserta.status = 'approved as external class';
                resultkelas.peserta.push(newPeserta);
                resultkelas.save();
                response(200, resultkelas, 'User berhasil di enroll', res);
            }else{
                response(400, {}, 'User tidak bisa enroll kelas ini', res);
            }
        }
        } else {
            response(400, {}, 'User sudah terdaftar di kelas', res);
        }
        } catch (error) {
          console.log(error.message);
          response(500, error, 'Server error', res);
        }
    },
      
}
