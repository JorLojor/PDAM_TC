const mongoose = require("mongoose");
const KelasModel = require("../models/kelas");
const sertifikatModel = require("../models/sertifikat");
const response =  require("../respons/response");

module.exports = {
    getSertifikat: async (req, res) => {
        try {
            const isPaginate = parseInt(req.query.paginate);
      
            if (isPaginate === 0) {
                const totalData = await sertifikatModel.countDocuments();
                const data = await sertifikatModel.find();
                result = {
                    data: data,
                    "total data": totalData,
                };
                response(200, result, "get sertifikat berhasil", res);
                return;
            }
      
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const totalData = await sertifikatModel.countDocuments();
      
            const data = await sertifikatModel
              .find()
              .skip((page - 1) * limit)
              .limit(limit);
      
            result = {
                data: data,
                "total data": totalData,
            };
      
            response(200, result, "Berhasil get all sertifikat", res);
        } catch (error) {
            response(500, error,error.message, res);
        }
        
    },
    getSertifikatReactSelect: async (req, res) => {
        try {
      
            const data = await sertifikatModel.find();

            const mapped = data.map((val,idx)=>{
                return {
                    value:val._id,
                    label:val.nama,
                    src:val.desain,
                    namePosition:val.namePosition
                }
            })

            result = {
                data: mapped,
            };
      
            response(200, result, "Berhasil get all sertifikat", res);
        } catch (error) {
            response(500, error,error.message, res);
        }
        
    },
    getSinglesertifikat: async (req, res) => {
        try {
          const idsertifikat = req.params.id;
          const sertifikat = await sertifikatModel.findById(idsertifikat);
    
          if (sertifikat) {
            response(200, sertifikat, "Berhasil get single sertifikat", res);
          } else {
            response(400, idsertifikat, "sertifikat tidak ditemukan", res);
          }
        } catch (error) {
          response(500, error, "Server error", res);
        }
      },
    createSeritifikat : async (req, res) => {
        const {nama,namePosition} = req.body;

        if (!req.file) {
            response(400,null,'Gambar desain harus diupload!',res)
            return;
        }
        
        let desain = req.file.path.split("/PDAM_TC/")[1];

        try {
            const sertifikat = new sertifikatModel({
                nama,
                desain,
                namePosition:JSON.parse(namePosition)
            });

            const result = await sertifikat.save();

            response(200, result, "Desain Sertifikat berhasil di buat", res);
        } catch (error) {
            response(500, error, "Server error", res);
        }
    },
    updateSertifikat: async (req, res) => {
        const id = req.params.id;
        const update = req.body;
        try{
            const sertifikat = await sertifikatModel.findByIdAndUpdate(id, update,{new:true});
            response(200, sertifikat, "sertifikat berhasil di update",res)
        }catch(error){
            response(500, error, "Server error failed to update",res);
        }
    },
    deleteSertifikat: async (req, res) => {
        const id = req.params.id;
        const session = await mongoose.startSession()
        session.startTransaction()
        try{
            const check = await KelasModel.find().session(session)
            
            const kelasHasSameCertificate = check.filter((v)=>(v.desainSertifikat && v.desainSertifikat.peserta.toString() === id) || (v.desainSertifikat && v.desainSertifikat.instruktur.toString() === id))
            
            if (kelasHasSameCertificate.length !== 0) {
                const selectedIds = kelasHasSameCertificate.map((v)=>{
                    return v._id
                })
                await KelasModel.updateMany({_id:{$in:selectedIds}},{$set:{desainSertifikat:null}},{new:true,session})
            }
            
            const result = await sertifikatModel.findByIdAndDelete(id);
            await session.commitTransaction()
            response(200, result, "sertifikat berhasil di hapus",res)
        }catch(error){
            response(500, error, error.message,res);
            await session.abortTransaction()
        } finally {
            session.endSession()
        }
    }
}