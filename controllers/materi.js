const mongoose = require('mongoose');
const MateriModel = require('../models/materi');
const response = require('../respons/response');

module.exports = {
    getAllMateri: async (req, res)=>{
        try{
        let {page, limits, isPaginate} = req.query
        const totalData = await MateriModel.countDocuments();

            if (isPaginate === 0){
                const data = await MateriModel.find()

                result = {
                    data : data,
                    "total data" : totalData
                }

                response(200,results,'get materi')
                return;
            }

            page = parseInt(page) || 1;
            limits = parseInt(limits) || 5;
            const data = await MateriModel.find()
            .skip((page - 1) * limits)
            .limit(limits)
            .populate('tugas')

            result = {
                data : data,
                "total data" : totalData
            }     

            response(200, result, 'Get all materi',res)
        }catch(error){
            console.log(error.message);
            response(500, error, 'Server error',res)
        }
    },
    getOneMateri: async (req, res)=>{
        try{

            const _id = req.params.id;
            const result = await MateriModel.findById(_id);

            if(!result){
                response(404, _id, 'Materi tidak di temukan',res)
            }

            response(200, result, 'Materi di dapat',res)
        }catch(error){ 
            response(500, error, 'Server error',res)
        }
    },
    createMateri: async (req, res)=>{
        try{
            const {kodeMateri, nama, description, type, source} = req.body;
            
            const materi = new MateriModel({
                kodeMateri,
                nama,
                description,
                type,
                source
            })

            const result = await materi.save();
            response(200, result, 'Materi berhasil di buat',res)
        }catch(error){
            response(500, error, 'Server error',res)
        }  
    },
    updateMateri: async (req, res)=>{
        const idMaterial = req.params.id;
        const update = req.body;

        try{
            const materi = await MateriModel.findByIdAndUpdate(idMaterial, update, {new: true});
            response(200, materi, 'Materi',res)
        }catch(error){
            response(500, error, 'Server error',res)
        }

    },
    deleteMateri: async (req, res)=>{
        const idMaterial = req.params.id;

        try{
            const materi = await MateriModel.findByIdAndRemove(idMaterial);
            response(200, materi, 'Materi deleted',res)
        }catch(error){
            response(500, error, 'Server error',res)
        }
        
    }
}
