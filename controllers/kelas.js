const mongoose = require('mongoose');
const KelasModel = require('../models/kelas');
const UserModel = require('../models/user');
const calonPesertaSchema = require('../models/calonpeserta');
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
            // .populate('materi instruktur peserta')

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
            response(500, error, 'Server error',res)
        }
    },
    createKelas: async (req, res) => {
        try {
            const {kodeKelas, nama,harga,kapasitasPeserta, description, methods ,instruktur, peserta,materi,jadwal,kodeNotaDinas} = req.body;
            
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
                jadwal,
                kodeNotaDinas
            });

            const result = await kelas.save();

            response(200, result, 'Kelas berhasil di buat',res)
        } catch (error) {
            console.log(error)
            response(500, error, 'Server error',res)
        }
    },
    createKelasTest: async (req, res) => {
        try {
            const {kodeKelas, nama,harga,kapasitasPeserta, description, methods ,instruktur, peserta,materi,kelasType} = req.body;
            
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
                kelasType
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

            const result = await KelasModel.findByIdAndUpdate(id, {materi : materi, description : deskripsi } , {new : true})// $push: { materi: { $each: materi } 

            response(200, result, 'Kelas berhasil di update',res)
        }catch (error){
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
        try {
          const id = req.params.id;
          const idUser = req.body.idUser;
          const resultkelas = await KelasModel.findById(id);
          const resultUser = await UserModel.findById(idUser);

          if (!resultkelas.peserta.includes(idUser)) {
           
            if (resultkelas.kelasType === 1 && resultUser.userType === 1){
                resultkelas.peserta.push(idUser);
                const result = await resultkelas.save();
                resultUser.kelas.push(id);
                const resultUserSave = await resultUser.save();
                const resultFix = { result, resultUserSave};
                response(200, resultFix, 'Berhasil enrol', res);

            }else if(resultkelas.kelasType === 0){
                resultkelas.peserta.push(idUser);
                const result = await resultkelas.save();
                resultUser.kelas.push(id);
                const resultUserSave = await resultUser.save();
                const resultFix = { result, resultUserSave};
                response(200, resultFix, 'Berhasil enrol', res);
                
            }else{
                response(401,resultkelas,'tidak bisa enrol', res);
            }

          } else {
            response(400, {}, 'User sudah terdaftar di kelas', res);
          }
        } catch (error) {
          response(500, error, 'Server error', res);
        }
    },
    enrollmentKelas: async (req, res) => {
        try{
            const id = req.params.id;
            const idUser = req.body.idUser;
            const resultkelas = await KelasModel.findById(id);
            const resultUser = await UserModel.findById(idUser);
            //ngecek kalo kelas sudah penuh
            if (resultkelas.peserta.length < resultkelas.kapasitasPeserta){
                //ngecek kalo user sudah terdaftar di kelas
                if (!resultkelas.peserta.includes(idUser)) {
                    //ngecek kalo user internal atau eksternal
                    if (resultkelas.kelasType === 1 && resultUser.userType === 1){
                        
                        const calonPeserta = new calonPesertaSchema({
                            kelas : id,
                            idUser : idUser,
                        });
                        //masukin si user ke field calonPeserta di kelas
                        resultkelas.calonPeserta.push(calonPeserta);
                        const result = await resultkelas.save();
                        response(200, result, 'Berhasil enrol harap tunggu di setujui', res);   

                    }else if(resultkelas.kelasType === 0 && resultUser.userType === 0){
                        const calonPeserta = new calonPesertaSchema({
                            kelas : id,
                            idUser : idUser,
                        });
                        //masukin si user ke field calonPeserta di kelas
                        resultkelas.calonPeserta.push(calonPeserta);
                        const result = await resultkelas.save();
                        response(200, result, 'Berhasil enrol harap tunggu di setujui', res);
                    }else if(resultkelas.kelasType === 0 || resultUser.userType === 1){
                    
                        const calonPeserta = new calonPesertaSchema({
                            kelas : id,
                            idUser : idUser,
                        })
                        //masukin si user ke field calonPeserta di kelas
                        resultkelas.calonPeserta.push(calonPeserta);
                        const result = await resultkelas.save();
                        response(200, result, 'Berhasil enrol harap tunggu di setujui', res);
                
                    }else{
                        response(401,resultkelas,'tidak bisa enrol', res);
                    }
                }else{
                    response(400, idUser, 'User sudah terdaftar di kelas', res);
                }
            }else{
                response(400, resultkelas, 'Kelas sudah penuh', res);
            }
        }catch(error){
            console.log(error.message)
            response(500, error, 'Server error',res)
        }
    },
    approvePeserta: async (req, res) => {
        try{
          //seleksi id kelas dan id peserta
          const {idKelas, idPeserta} = req.body;
          //nyari kelas berdasarkan id kelas
          const kelas = await KelasModel.findById(idKelas);
          //nyari peserta berdasarkan id peserta di field calonPeserta
          const calonPeserta = await KelasModel.findOne({'calonPeserta._id' : idPeserta});
            //nyari user berdasarkan id peserta
            const user = await UserModel.findById(calonPeserta.idUser);
            //ngecek kalo kelas sudah penuh
            if (kelas.peserta.length < kelas.kapasitasPeserta){
                response(400, kelas, 'Kelas sudah penuh', res);
            }
            //masukin user ke field peserta di kelas
            kelas.peserta.push(calonPeserta.idUser);
            //ngehapus user di field calonPeserta di kelas
            kelas.calonPeserta.pull(idPeserta);
            response(200, kelas, 'Berhasil approve peserta', res);
        }catch(error){
            console.log(error.message)
            response(500, error, 'Server error',res)
        }
      }
}
