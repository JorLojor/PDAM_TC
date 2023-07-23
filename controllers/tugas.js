const mongoose = require('mongoose');
const tugasSchema = require('../models/tugas');

const response = require('../respons/response');
const upload = require('../middleware/filepath');
const uploadFile = require('../middleware/filepath');
const multer = require('multer');
// const storageRef = require('../middleware/firebaseConfig');
require('dotenv').config();

// firebase storage
// const firebase = require('firebase');
// const config = {
//   apiKey: process.env.firebase_storage,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
// };

// firebase.initializeApp(config);

// const storage = firebase.storage();

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
        const session = await mongoose.startSession();
        session.startTransaction();
        try{
            const {description, dateStarted, dateFinished, fileText} = req.body;
            const fileTugas = req.file.path;

            const tugas = new tugasSchema({
                description,
                dateStarted,
                dateFinished,
                fileText,
                fileTugas
            });
            const result = await tugas.save();
            await session.commitTransaction();
            session.endSession();
            response(200, result, "tugas berhasil di tambahkan",res)
        }catch(error){
            await session.abortTransaction();
            session.endSession();
            response(500, error, "Server error failed to add",res);
        }finally{
            session.endSession();
        }
        // upload(req, res, async (error) => {
        //     if (error instanceof multer.MulterError) {
        //         console.log(error.message);
        //       response(500, error, 'internal server error \n gagal menambahkan file', res);
        //     } else if (error) {
        //         console.log(error.message);
        //       response(500, error, 'internal server error \n gagal menambahkan file', res);
        //     }else{
        //         try{ 
        //             const {description, dateStarted, dateFinished} = req.body;
        //             const fileTugas = req.file.path;

        //             const tugas = new tugasSchema({
        //                 description, 
        //                 dateStarted, 
        //                 dateFinished, 
        //                 fileTugas
        //             });
        //             const result = await tugas.save();
        //             response(200, result, "tugas berhasil di tambahkan",res)
        //         }catch(error){
        //             response(500, error, "Server error failed to add",res);
        //         }
        //     }
        // });
    },
    creteTugasSecond: async (req, res) => { //pake ini aja
        try{
            const {description, dateStarted, dateFinished, fileText, pengumpulanTugas} = req.body;

            const tugas = new tugasSchema({
                description,
                dateStarted,
                dateFinished,
                fileText,
                pengumpulanTugas
            });
            console.log("test");
            const result = await tugas.save();
            response(200, result, "tugas berhasil di tambahkan",res)
        }catch(error){
            response(500, error.message, "Server error failed to add",res);
        }
    },
    pengumpulanTugas: async (req, res) => { // fungsi putgumpulin tugas
        const idTugas = req.params.id;
        try {
            const tugas = await tugasSchema.findById(idTugas);
            if (!tugas) {
                return response(404, null, "Tugas not found", res); // ini kalo nga menemukan tugas
            }
      
            const user = new mongoose.Types.ObjectId(req.body.user);
            const answer = req.body.answer;
            const file = req.body.path;
      
            const pengumpulan = {
                user,
                answer,
                file,
            };
      
            tugas.pengumpulanTugas.push(pengumpulan);

            const savedTugas = await tugas.save();

            response(200, savedTugas, "Pengumpulan berhasil ditambahkan", res);
        } catch (error) {
          console.log(error.message);
          response(500, error, "Server error", res);
        }

    },
    // test
    penilaian:async (req, res) => {
        try{
            const id = req.params._id;
            const idUser = req.body._idUser;
            const {nilai} = req.body;
            const resultPengumpulan = await tugasSchema.findByIdAndUpdate(id, { nilai });
            const resultUser = await UserModel.findById(idUser);
            let nilaiuser = resultUser.nilai;
            const nilaiAkhir = (nilaiuser + nilai);
            const resultFix = {resultPengumpulan, resultUser, nilaiAkhir}   
            response(200, resultFix, "tugas berhasil di update",res)

        }catch(error){
            response(500, error, "Server error failed to update",res);
        }
    },
    penilaianSecondary:async (req, res) => {
        try{
            const id = req.params._id;
            const idUser = req.body._idUser;
            const {nilai} = req.body;

            const session = await mongoose.startSession();
            session.startTransaction();

            const resultPengumpulan = await tugasSchema.findByIdAndUpdate(id, { nilai }, {session});

            const resultUser = await UserModel.findById(idUser);
            let nilaiuser = resultUser.nilai;
            const nilaiAkhir = (nilaiuser + nilai);
            const resultFix = {resultPengumpulan, resultUser, nilaiAkhir}

            await session.commitTransaction();
            session.endSession();
            response(200, resultFix, "tugas berhasil di update",res)

        }catch(error){
            response(500, error, "Server error failed to update",res);
        }finally{
            await session.endSession();
        }
    },
    penilaianPrimary:async (req, res) => { // fungsi put yang di gunakan instruktur saat menilai tugas
        try{
            const id = req.params._id; // id tugas
            const tugas = await tugasSchema.findById(id);
            console.log('---- tugas -----',tugas,'---------------------------------- \n');
            //2. cari tugas yang di kumpulkan
            const penilaian = tugas.pengumpulanTugas;
            console.log('---- sebelum penilaian -----',penilaian,'---------------------------------- \n');
            //3. update nilai tugas
            const nilai = req.body.nilai;
            const resultTugas = await penilaian.updateOne({nilai}, {new:true});
            console.log('---- sesudah penilaian -----',penilaian,'---------------------------------- \n');
            //4. mencari materiSchema yang memiliki tugas yang sama dengan tugas yang di kumpulkan
            const schemaMateri = await materiSchema.findById(tugas._id);
            console.log('---- schema materi -----',schemaMateri,'---------------------------------- \n');
            //5. mencari field nilaiPermateri
            const nilaiMateri = schemaMateri.nilaiPermateri;
            console.log('---- nilai materi -----',nilaiMateri,'---------------------------------- \n');
            const nilaiAkhir = nilaiMateri + nilai;
            //6. update nilaiPermateri
            const resultMateri = await schemaMateri.updateOne({nilaiPermateri: + nilaiAkhir}, {new:true});
            console.log('---- nilai akhir -----',nilaiAkhir,'---------------------------------- \n');

            const finalResult = {"nilai tugas":resultTugas,"nilai materi":resultMateri}
            response(200, finalResult, "tugas berhasil di update",res)
        }catch(error){
            console.log(error.message);
            response(500, error, "Server error failed to update",res);
        }
    },
    // test
    createTugasThird: async (req, res) => {
        try {
          uploadFile(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
              response(500, error, 'Internal server error \n Gagal mengunggah file', res);
            } else if (error) {
              response(500, error, 'Internal server error \n Gagal mengunggah file', res);
            } else {
              const { description, dateStarted, dateFinished } = req.body;
              const fileTugas = req.file;
      
              // Upload file ke Firebase Storage
              const storageRef = require('../middleware/firebaseConfig');
              const fileRef = storageRef.child(fileTugas.originalname);
              const fileSnapshot = await fileRef.put(fileTugas.buffer);
              const downloadURL = await fileSnapshot.ref.getDownloadURL();
      
              // Simpan data tugas dengan URL unduhan
              const tugas = new tugasSchema({
                description,
                dateStarted,
                dateFinished,
                fileTugas: downloadURL,
              });
              const result = await tugas.save();
              response(200, result, 'Tugas berhasil ditambahkan', res);
            }
          });
        } catch (error) {
          response(500, error, 'Server error failed to add', res);
        }
    },
    createTugasfirBase:async (req, res) => {
        // try{
            
        //     const storageRef = storage.ref();
        //     const fileRef = storageRef.child(req.file.originalname);
        //     const fileSnapshot = await fileRef.put(req.file.buffer);
        //     const downloadURL = await fileSnapshot.ref.getDownloadURL();
        //     // Save tugas data with download URL
        //     const tugas = new tugasSchema({
        //         description: req.body.description,
        //         dateStarted: req.body.dateStarted,
        //         dateFinished: req.body.dateFinished,
        //         fileTugas: downloadURL,
        //     });
        //     const result = await tugas.save();
        //     response(200, result, 'Tugas berhasil ditambahkan', res);
        // }catch(error) {
        //     response(500, error, 'Server error failed to add', res);
        // }
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
            const tugas = await tugasSchema.findByIdAndDelete(id);
            response(200, tugas, "tugas berhasil di hapus",res)
        }catch(error){
            console.log(error.message);
            response(500, error, "Server error failed to delete",res);
        }
    },
}
