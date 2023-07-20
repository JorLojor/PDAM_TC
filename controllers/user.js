const mongoose = require("mongoose");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const response = require("../respons/response");

module.exports = {
    register:async (req, res) => {
        try{

            const {name, email, username, password, role, userType} = req.body;
            const cekUser = await userModel.findOne({
                $or: [{ username }, { email }],
            });
            if (cekUser) {
                response(400, username, "Username atau email sudah terdaftar",res);
                return;
            }
            const passwordHash = bcrypt.hashSync(password, 10);
            const user = new userModel({
                name,
                email,
                username,
                password: passwordHash,
                role , // 1 = admin, 2 = instruktur, 3 = user
                userType ,// 1 = internal pdam dan 0 = eksternal pdam atau All
            })
            await user.save();

            response(200, user, "Register berhasil",res);
        }catch(error){
            console.log(error.message)
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
            console.log(user);
            if (user) {
                const cekPassword = bcrypt.compareSync(password, user.password);
                if (cekPassword) {
                    const token = jwt.sign({id : user._id , role : user.role},secret_key);
                    response(200, token, "Login berhasil",res);
                } else {
                    response(400, username, "Password salah",res);
                }
            }else{
                response(400, username, "User tidak terdaftar",res);
            }
        }catch(error){
            response(500, error, "Server error",res);
        }
    },
    getAllUser:async (req, res) => { // pake pagination
        try{
            const isPaginate = parseInt(req.query.paginate);

            if (isPaginate === 0) {
                const totalData = await userModel.countDocuments()
                const data = await userModel.find()
                // .populate("kelas");
                result = {
                    data : data,
                    "total data" : totalData
                }         
                response(200, result, "get user",res);
                return;
            }

            const page =  parseInt(req.query.page) || 1;
            const limit =  parseInt(req.query.limit) || 10;
            const totalData = await userModel.countDocuments() 

            const data = await userModel.find()
            .skip((page - 1) * limit)
            .limit(limit)
            // .populate("kelas")

            result = {
                data : data,
                "total data" : totalData
            }         

            response(200, result, "Berhasil get all user",res);   
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
          const user = await userModel.findByIdAndUpdate(idUser, updatedUser, {
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
