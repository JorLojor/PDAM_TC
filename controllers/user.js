const mongoose = require("mongoose");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const response = require("../respons/response");


module.exports = {
    register:async (req, res) => {
        try{
            const {name, email, username, password} = req.body;
            const cekUser = await userModel.findOne({
                $or: [{ username }, { email }],
            });
            if (cekUser) {
                response(400, username, "Username atau email sudah terdaftar",res);
            }
            const passwordHash = bcrypt.hashSync(password, 10);
            const user = new userModel({
                name,
                email,
                username,
                password: passwordHash,
            })
            console.log('test');
            await user.save();
            response(200, user, "Register berhasil",res);
        }catch(error){
            response(500, error, "Server error",res);
        }
    },
    login:async (req, res) => {
        try{
            const {username, password} = req.body;
            const secret_key = process.env.secret_key
            const user = await userModel.findOne({
                $or: [{ username }, { email: username }],
            });
            if (user) {
                const cekPassword = bcrypt.compareSync(password, user.password);
                if (cekPassword) {
                    const token = jwt.sign({id: user._id,},secret_key);
                    response(200, token, "Login berhasil",res);
                } else {
                    response(400, username, "Password salah",res);
                }
            }
        }catch(error){
            response(500, error, "Server error",res);
        }
    },
    getAllUser:async (req, res) => { // pake pagination
        try{
            const {page, limit, isPaginate} = req.query;
            if (isPaginate === 0) {
                const result = await userModel.find();
                response(200, result, "get user",res);
                return;
            }
            page =  parseInt(page, 10) || 1;
            limit =  parseInt(limit, 10) || 10;
            const totalData = await userModel.countDocuments() 
            const result = await userModel.find()
            .populate("User")
            .skip((page - 1) * limit)
            .limit(limit)
            response(200, result, {totalData, totalPage, page}, "Berhasil get all user",res);            
        }catch(error){
            response(500, error, "Server error",res);
        }
    },
    getSingleUser:async (req, res) => {
        try{
            const idUser = req.params.id;
            const user = await userModel.findById(idUser);
            if (user) {
                response(200, user, "Berhasil get single user",res);
            } else {
                response(400, idUser, "User tidak ditemukan",res);
            }
        }catch(error){
            response(500, error, "Server error",res);
        }
    },
    updateUser:async (req, res) => {
        const idUser = req.params.id;
        const updatedUser = req.body;
        try {
          const user = await userModel.findByIdAndUpdate(userId, updatedUser, {
            new: true,
          });
          res.json(user);
        } catch (error) {
          res.status(500).json({ error: "Internal server error, coba lagi" });
        }
    },
    deleteUser:async (req, res) => {
        const idUser = req.params.id;
        try {
          const user = await userModel.findByIdAndRemove(idUser);
          res.json(user);
        } catch (error) {
          res.status(500).json({ error: "Internal server error, coba lagi" });
        }
    },

}
