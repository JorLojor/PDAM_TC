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
            response(500, error, "Server error", res);
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
        try {
            const {kelas,desain} = req.body;
            const sertifikat = new sertifikatModel({
                kelas,
                desain
            });

            const result = await sertifikat.save();

            response(200, result, "sertifikat berhasil di buat", res);
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
        try{
            const result = await sertifikatModel.findByIdAndDelete(id);
            response(200, result, "sertifikat berhasil di hapus",res)
        }catch(error){
            response(500, error, "Server error failed to delete",res);
        }
    }
}