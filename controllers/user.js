const mongoose = require("mongoose");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const response = require("../respons/response");

module.exports = {
  //pendafataran user oleh admin
  createUser: async (req, res) => {
    try {
      const { name, email, username, password, role, userType} = req.body;
      const cekUser = await userModel.findOne({
        $or: [{ username }, { email }],
      });
      if (cekUser) {
        response(400, username, "Username atau email sudah terdaftar", res);
        return;
      }
      const passwordHash = bcrypt.hashSync(password, 10);
      const user = new userModel({
        name,
        email,
        username,
        password: passwordHash,
        role,
        userType,
        status : 'approved'
      });
      await user.save();

      response(200, user, "Register berhasil", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },
  //registrasi untuk pendafataran peserta diluar PDAM (eksternal)
  register: async (req, res) => {
    try {
      const { name, email, username, password } = req.body;
      const cekUser = await userModel.findOne({
        $or: [{ username }, { email }],
      });
      if (cekUser) {
        response(400, username, "Username atau email sudah terdaftar", res);
        return;
      }
      const passwordHash = bcrypt.hashSync(password, 10);
      const user = new userModel({
        name,
        email,
        username,
        password: passwordHash
      });
      await user.save();

      response(200, user, "Register berhasil", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const secret_key = process.env.secret_key;
      const user = await userModel.findOne({
        $or: [{ username }, { email: username }],
      });
      if (user) {
        const cekPassword = bcrypt.compareSync(password, user.password);
        if (cekPassword) {
          const token = jwt.sign({ id: user._id, role: user.role }, secret_key);
          response(200, { token, user }, "Login berhasil", res);
        } else {
          response(400, username, "Password salah", res);
        }
      } else {
        response(400, username, "User tidak terdaftar", res);
      }
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },
  getAllUser: async (req, res) => {
    // pake pagination
    try {
      const isPaginate = parseInt(req.query.paginate);

      if (isPaginate === 0) {
        const totalData = await userModel.countDocuments();
        const data = await userModel.find();
        // .populate("kelas");
        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get user", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const totalData = await userModel.countDocuments();

      const data = await userModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit);
      // .populate("kelas")

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all user", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },
  getSingleUser: async (req, res) => {
    try {
      const idUser = req.params.id;
      const user = await userModel.findById(idUser);

      if (user) {
        response(200, user, "Berhasil get single user", res);
      } else {
        response(400, idUser, "User tidak ditemukan", res);
      }
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },
  updateUser: async (req, res) => {
    const idUser = req.params.id;
    const updatedUser = req.body;

    try {
      const user = await userModel.findByIdAndUpdate(idUser, updatedUser, {
        new: true,
      });
      response(200, user, "Berhasil update user", res);
    } catch (error) {
      res.status(500).json({ error: "Internal server error, coba lagi" });
    }
  },
  deleteUser: async (req, res) => {
    const idUser = req.params.id;

    try {
      const user = await userModel.findByIdAndRemove(idUser);
      response(200, user, "Berhasil delete user", res);
    } catch (error) {
      res.status(500).json({ error: "Internal server error, coba lagi" });
    }
  },
  getStatusPendingUser: async (req, res) => {//admin dapat melihat list orang yang baru registrasi
    try {
      const user = await userModel.find();
      console.log(user);
      const filtered = user.filter((val)=>{
        return val.status === 'pending';
      });
      response(200, filtered, "Berhasil get status pending user", res);
    }catch (error){
      res.status(500).json({ error: "Internal server error, coba lagi" });
    }
  },
  updateStatusUser: async(req,res)=>{//admin dapat setuju atau menolak registrasi user
    const id = req.params.id; //idUser yang ingin dirubah
    const status = Boolean(req.params.id);
    try{
      let newStatus = ''
      user = await userModel.findById(id);

      if (status){
        newStatus = 'accepted';
      }else{
        newStatus = 'declined';
      }

      const result = await userModel.findOneAndUpdate({_id:id},{status : newStatus}, {new:true})
      response(200, result, "Berhasil get status pending user", res);
    }catch (error){
      res.status(500).json({ error: "Internal server error, coba lagi" });
    }
  }
};
