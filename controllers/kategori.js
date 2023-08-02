const mongoose = require("mongoose");
const kategoriModel = require("../models/kategori");

const response =  require("../respons/response");

module.exports = {
    getKategori: async (req, res) => {
        try {
            const isPaginate = parseInt(req.query.paginate);
      
            if (isPaginate === 0) {
                const totalData = await kategoriModel.countDocuments();
                const data = await kategoriModel.find();
                result = {
                    data: data,
                    "total data": totalData,
                };
                response(200, result, "get kategori berhasil", res);
                return;
            }
      
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const totalData = await kategoriModel.countDocuments();
      
            const data = await kategoriModel
              .find()
              .skip((page - 1) * limit)
              .limit(limit);
      
            result = {
                data: data,
                "total data": totalData,
            };
      
            response(200, result, "Berhasil get all kategori", res);
        } catch (error) {
            response(500, error, "Server error", res);
        }
        
    },
    getSingleKategori: async (req, res) => {
        try {
          const idKategori = req.params.id;
          const kategori = await kategoriModel.findById(idkategori);
    
          if (kategori) {
            response(200, kategori, "Berhasil get single kategori", res);
          } else {
            response(400, idkategori, "kategori tidak ditemukan", res);
          }
        } catch (error) {
          response(500, error, "Server error", res);
        }
      },
    createKategori : async (req, res) => {
        try {
            const {sampul,icon,name} = req.body;
            const kategori = new kategoriModel({
                sampul,
                icon,
                name
            });

            const result = await kategori.save();

            response(200, result, "kategori berhasil di buat", res);
        } catch (error) {
            response(500, error, "Server error", res);
        }
    },
    updateKategori: async (req, res) => {
        const id = req.params.id;
        const update = req.body;
        try{
            const kategori = await kategoriModel.findByIdAndUpdate(id, update,{new:true});
            response(200, kategori, "kategori berhasil di update",res)
        }catch(error){
            response(500, error, "Server error failed to update",res);
        }
    },
    deleteKategori: async (req, res) => {
        const id = req.params.id;
        try{
            const result = await kategoriModel.findByIdAndDelete(id);
            response(200, result, "kategori berhasil di hapus",res)
        }catch(error){
            response(500, error, "Server error failed to delete",res);
        }
    }
}