const mongoose = require("mongoose");
const userModel = require("../models/user");
const Sertifikat = require("../models/sertifikat");
const Kelas = require("../models/kelas");
const Kategori = require("../models/kategori");
const ratingModel = require("../models/rating");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const response = require("../respons/response");
const user = require("../models/user");
const tokenGenerator = require("../service/mail/tokenGenerator");
const sendConfirmationEmail = require("../service/mail/config");

module.exports = {
  createUser: async (req, res) => {
    try {
      const {
        name,
        email,
        username,
        password,
        role,
        userType,
        instansi,
        nipp,
      } = req.body;
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
        status: "approved",
        instansi,
        nipp,
      });
      await user.save();

      response(200, user, "Register berhasil", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  register: async (req, res) => {
    try {
      const { name, email, username, password, is_enrollment, kelas } =
        req.body;

      const cekUser = await userModel.findOne({
        $or: [{ username }, { email }],
      });

      if (cekUser) {
        response(400, username, "Username atau email sudah terdaftar", res);
        return;
      }

      let checkKelas = null;

      if (is_enrollment == true) {
        if (!kelas) {
          return response(400, {}, "Mohon isi kelas", res);
        }

        checkKelas = await Kelas.findById(kelas);

        if (!checkKelas) {
          return response(400, {}, "Kelas tidak ditemukan", res);
        }
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      const user = new userModel({
        name,
        email,
        username,
        password: passwordHash,
      });

      await user.save();

      if (is_enrollment == true) {
        const extractedPesertaKelas = [...checkKelas.peserta];
        const extractedKelasUser = [...user.kelas];

        extractedPesertaKelas.push({
          user: user._id,
        });

        extractedKelasUser.push({
          kelas: checkKelas._id,
        });

        await Kelas.findOneAndUpdate(
          { _id: kelas },
          { $set: { peserta: extractedPesertaKelas } },
          { new: true }
        );

        await userModel.findOneAndUpdate(
          { _id: user._id },
          { $set: { kelas: extractedKelasUser } },
          { new: true }
        );
      }

      response(200, user, "Register berhasil", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  login: async (req, res) => {
    try {
      const { username, password, is_enrollment, kelas } = req.body;

      const secret_key = process.env.secret_key;

      let checkKelas = null;

      if (is_enrollment == true) {
        if (!kelas) {
          return response(400, {}, "Mohon isi kelas", res);
        }

        checkKelas = await Kelas.findById(kelas);

        if (!checkKelas) {
          return response(400, {}, "Kelas tidak ditemukan", res);
        }
      }

      const user = await userModel.findOne({
        $or: [{ username }, { email: username }],
      });

      if (user) {
        const cekPassword = bcrypt.compareSync(password, user.password);
        if (cekPassword) {
          if (is_enrollment == true && user.role == 3) {
            const extractedPesertaKelas = [...checkKelas.peserta];
            const extractedKelasUser = [...user.kelas];

            extractedPesertaKelas.push({
              user: user._id,
            });

            extractedKelasUser.push({
              kelas: checkKelas._id,
            });

            await Kelas.findOneAndUpdate(
              { _id: kelas },
              { $set: { peserta: extractedPesertaKelas } },
              { new: true }
            );

            await userModel.findOneAndUpdate(
              { _id: user._id },
              { $set: { kelas: extractedKelasUser } },
              { new: true }
            );
          }

          const token = jwt.sign({ id: user._id, role: user.role }, secret_key);

          response(200, { token, user }, "Login berhasil", res);
        } else {
          response(400, username, "Password salah", res);
        }
      } else {
        response(400, username, "User tidak terdaftar", res);
      }
    } catch (error) {
      console.log(error);

      response(500, error, "Server error", res);
    }
  },

  getAllUser: async (req, res) => {
    // pake pagination
    try {
      const isPaginate = parseInt(req.query.paginate);

      if (isNaN(isPaginate)) {
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
        .limit(limit)
        .sort({createdAt:-1});
      // .populate("kelas")

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all user", res);
    } catch (error) {
      console.log(error.message);
      response(500, error, "Server error", res);
    }
  },

  getSingleUser: async (req, res) => {
    try {
      const id = req.body._id;
      const user = await userModel.findOne({ _id: id }, "-password").populate({
        path: "kelas.kelas",
        populate: {
          path: "kategori",
        },
      });

      if (user) {
        response(200, user, "Berhasil get single user", res);
      } else {
        response(400, user, "User tidak ditemukan", res);
      }
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updateUser: async (req, res) => {
    const idUser = req.params.id;
    const updatedUser = req.body;

    console.log(req.file);
    console.log(req.body);

    let body;

    body = {
      ...req.body,
    };

    if (req.file) {
      const imageProfile = req.file.path.split("/PDAM_TC/")[1];
      body = {
        ...req.body,
        userImage: imageProfile,
      };
    }

    try {
      const user = await userModel.findByIdAndUpdate(idUser, body, {
        new: true,
      });
      response(200, user, "Berhasil update user", res);
    } catch (error) {
      res.status(500).json({ error: "Internal server error, coba lagi" });
    }
  },

  getCertificate: async (req, res) => {
    try {
      const id = req.user.id;

      const kelasName =
        req.query.kelas && req.query.kelas.length > 0 ? req.query.kelas : null;

      const user = await userModel.findById(id);

      let data = [];
      let kelas = [];

      if (user.kelas.length > 0) {
        user.kelas.map((m) => {
          if (m.isDone == true) {
            kelas.push(m.kelas);
          }
        });
      }

      if (kelas.length > 0) {
        for (let i = 0; i < kelas.length; i++) {
          const detailKelas = await Kelas.findById(kelas[i]);

          if (kelasName) {
            if (!detailKelas.nama.includes(kelasName)) {
              continue;
            }
          }

          const sertifikat = await Sertifikat.findById(
            detailKelas.desainSertifikat.peserta
          );

          data.push({ sertifikat, kelas: detailKelas.nama });
        }
      }

      response(200, data, "Data sertifikat", res);
    } catch (error) {
      console.log(error.message);

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

  getStatusPendingUser: async (req, res) => {
    try {
      const user = await userModel.find();
      console.log(user);
      const filtered = user.filter((val) => {
        return val.status === "pending";
      });
      response(200, filtered, "Berhasil get status pending user", res);
    } catch (error) {
      response(500, error.message, error.message, res);
    }
  },

  updateStatusUser: async (req, res) => {
    //admin dapat setuju atau menolak registrasi user
    const id = req.params.id; //idUser yang ingin dirubah
    const status = req.body.status; //status yang ingin dirubah
    try {
      const result = await userModel.findOneAndUpdate(
        { _id: id },
        { status: status },
        { new: true }
      );
      response(200, result, "Berhasil get status pending user", res);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error, coba lagi" });
    }
  },

  getByRole: async (req, res) => {
    const { role } = req.params;

    try {
      const isPaginate = parseInt(req.query.paginate);

      if (isPaginate === 0) {
        const totalData = await userModel.countDocuments();
        const data = await userModel.find({ role: parseInt(role) });
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
        .find({ role: parseInt(role) })
        .skip((page - 1) * limit)
        .limit(limit);
      // .populate("kelas")

      result = {
        data: data,
        "total data": totalData,
      };
      response(200, result, "Data per role ditemukkan", res);
    } catch (error) {
      response(500, [], error.message, res);
    }
  },

  getByRoleReactSelect: async (req, res) => {
    const { role } = req.params;

    try {
      const data = await userModel.find({ role: parseInt(role) });
      // .populate("kelas")

      let user = data.map((val, idx) => {
        return {
          value: val._id,
          label: `${val.name} (${val.username}) - ${
            val.userType === 1 ? "Internal" : "Eksternal"
          }`,
        };
      });

      result = {
        data: user,
        "total data": user.length,
      };
      response(200, result, "Data per role ditemukkan", res);
    } catch (error) {
      response(500, [], error.message, res);
    }
  },

  getWithFilter: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);
      let totalData;

      if (isPaginate === 0) {
        const data = await userModel.find({ ...req.body }).select("-password");

        if (data) {
          totalData = data.length;
        }

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get user", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const data = await userModel
        .find({ ...req.body })
        .sort({createdAt:-1})
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit)
      // .populate("kelas")

      if (data) {
        totalData = data.length;
      }

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get filtered user", res);
    } catch (error) {
      console.log(error);

      response(500, error, error.message, res);
    }
  },
  getUserClass: async (req, res) => {
    const { id } = req.params;

    try {
      let get = await userModel
        .findById(id)
        .populate("kelas.kelas")
        .select("kelas");

      get = await Kategori.populate(get, {
        path: "kelas.kelas.kategori",
      });

      response(200, get, "Data ditemukan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
  updatePassword: async (req, res) => {
    const { id } = req.params;

    try {
      const getUser = await userModel.findOne({ _id: id }).select("password");

      if (req.body.old) {
        const cekPassword = bcrypt.compareSync(req.body.old, getUser.password);
        if (!cekPassword) {
          response(400, null, "Password lama salah!", res);
          return;
        }
      }

      const passwordHash = bcrypt.hashSync(req.body.new, 10);
      const user = await userModel.findByIdAndUpdate(
        id,
        { password: passwordHash },
        {
          new: true,
        }
      );

      response(200, user, "Berhasil merubah password!", res);
    } catch (error) {
      response(500, error, error.message, res);
      console.log(error);
    }
  },
  resetPassword: async (req, res) => {
    const { id, code } = req.params;

    try {
      const getUser = await userModel
        .findOne({ _id: id, access_token: code })
        .select("password");

      if (!getUser) {
        response(403, null, "Invalid Key or Invalid ID");
        return;
      }

      const passwordHash = bcrypt.hashSync(req.body.new, 10);
      const user = await userModel.findByIdAndUpdate(
        id,
        { $set: { password: passwordHash, access_token: null } },
        {
          new: true,
        }
      );

      response(200, user, "Berhasil merubah password!", res);
    } catch (error) {
      response(500, error, error.message, res);
      console.log(error);
    }
  },
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const check = await userModel.findOne({ email }).session(session);

      if (!check) {
        response(400, check, `User dengan email ${email} tidak ada!`, res);
        await session.abortTransaction();
        return;
      }

      const token = tokenGenerator();

      const update = await userModel.findOneAndUpdate(
        { _id: check._id },
        { $set: { access_token: token } },
        { new: true, session }
      );
      await sendConfirmationEmail(email, update.access_token, update.username);
      await session.commitTransaction();

      response(200, update, "Berhasil mengirim konfirmasi reset password", res);
    } catch (error) {
      response(500, null, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },
  checkUserResetPassword: async (req, res) => {
    const { code } = req.params;

    try {
      const check = await userModel.findOne({ access_token: code });

      if (!check) {
        response(403, null, "Invalid Code!");
        return;
      }

      response(200, check, "User berhasil ditemukan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },
  rate: async (req, res) => {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const { user, rating, comment } = req.body;
        const { id } = req.params;
        let rate = new ratingModel({
          user,
          rating,
          comment,
        });

        const saveRate = await rate.save({ session });

        const getRatingUser = await userModel
          .findOne({ _id: id })
          .session(session);

        if (!getRatingUser) {
          response(
            500,
            null,
            "Terjadi kesalahan saat update rating user!",
            res
          );
          return;
        }

        const newRating = [...getRatingUser.rating, saveRate._id];

        const updateRatingUser = await userModel.findOneAndUpdate(
          { _id: id },
          { rating: newRating },
          { new: true, session }
        );

        if (!updateRatingUser) {
          response(
            500,
            null,
            "Terjadi kesalahan saat update rating user!",
            res
          );
          return;
        }

        response(200, updateRatingUser, "Rating berhasil dimasukan", res);
      });

      // Commit the transaction
      await session.commitTransaction();
    } catch (error) {
      // Abort the transaction on error
      // await session.abortTransaction();
      response(500, error, error.message, res);
    } finally {
      // End the session
      session.endSession();
    }
  },
  forcedUpdate: async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);

      const forceUpdate = await userModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );
      res.json({
        message: "Berhasil",
        data: forceUpdate,
      });
    } catch (error) {
      res.json({
        message: error.message,
        data: [],
      });
    }
  },
};
