const mongoose = require("mongoose");
const ClassResolvementRequest = require("../models/classResolvementRequest");
const Materi = require("../models/materi");
const userModel = require("../models/user");
const Sertifikat = require("../models/sertifikat");
const Kelas = require("../models/kelas");
const Kategori = require("../models/kategori");
const ratingModel = require("../models/rating");
const Nipp = require("../models/nipp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const response = require("../respons/response");
const tokenGenerator = require("../service/mail/tokenGenerator");
const {
  sendConfirmationEmail,
  sendUserStatusMail,
  sendClassResolvementMail,
} = require("../service/mail/config");

module.exports = {
  getbyEmail: async (req, res) => {
    try {
      const { email } = req.body;

      const data = await userModel
        .find({
          email,
        })
        .select("email username name role");

      response(200, data, "get user by email", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  createUser: async (req, res) => {
    try {
      const {
        name,
        email,
        username,
        password,
        role,
        instansi,
        nipp,
        bio,
        pendidikan,
        kompetensi,
        bidang,
        link_cv,
        phone,
      } = req.body;

      const cekUser = await userModel.findOne({
        username,
      });

      if (cekUser) {
        response(400, username, "Username sudah terdaftar", res);
        return;
      }

      const checkEmail = await userModel.findOne({
        email,
        $and: [
          {
            role,
          },
        ],
      });

      if (checkEmail) {
        response(400, email, "E-mail sudah terdaftar", res);
        return;
      }

      let valuePendidikan = pendidikan ? JSON.parse(pendidikan) : [];
      let valueKompetensi = kompetensi ? JSON.parse(kompetensi) : [];
      let valueBidang = bidang ? JSON.parse(bidang) : [];

      const passwordHash = bcrypt.hashSync(password, 10);

      let userType = 0;

      const checkNipp = await Nipp.findOne({ nipp: nipp });

      if (checkNipp) {
        userType = 1;
      }

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
        bio,
        pendidikan: valuePendidikan,
        kompetensi: valueKompetensi,
        bidang: valueBidang,
        link_cv,
        phone,
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
        .sort({ createdAt: -1 });
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

    body.bidang = body.bidang ? JSON.parse(body.bidang) : [];
    body.pendidikan = body.pendidikan ? JSON.parse(body.pendidikan) : [];
    body.kompetensi = body.kompetensi ? JSON.parse(body.kompetensi) : [];
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

  submitClassResolvementList: async (req, res) => {
    try {
      const { user, kelas } = req.query;

      let ids = [];
      let len = 0;

      if (user) {
        const userData = await userModel.find();

        if (user) {
          len = user.length;

          userData.map((u) => {
            if (u.name.substring(0, len) == user) {
              ids.push(u._id);
            }

            if (u.email.substring(0, len) == user) {
              ids.push(u._id);
            }
          });
        }
      }

      let data = await ClassResolvementRequest.find()
        .populate("user")
        .populate("kelas")
        .sort({ createdAt: -1 });

      if (user && kelas) {
        data = await ClassResolvementRequest.find({
          user: { $in: ids },
          $and: [
            {
              kelas,
            },
          ],
        })
          .populate("user")
          .populate("kelas")
          .sort({ createdAt: -1 });
      } else if (user) {
        data = await ClassResolvementRequest.find({
          user: { $in: ids },
        })
          .populate("user")
          .populate("kelas")
          .sort({ createdAt: -1 });
      } else if (kelas) {
        data = await ClassResolvementRequest.find({
          kelas,
        })
          .populate("user")
          .populate("kelas")
          .sort({ createdAt: -1 });
      }

      return response(200, data, "List Permohonan", res);
    } catch (error) {
      console.log(error.message);

      return res
        .status(500)
        .json({ error: "Internal server error, coba lagi" });
    }
  },

  submitClassResolvement: async (req, res) => {
    try {
      const { kelas } = req.body;

      if (!kelas) {
        return response(400, {}, "Mohon isi kelas", res);
      }

      const validKelas = await Kelas.findOne({
        slug: kelas,
      });

      if (!validKelas) {
        return response(404, {}, "Kelas tidak ditemukan", res);
      }

      const user = await userModel.findById(req.user.id);

      const haveSubmitted = await ClassResolvementRequest.findOne({
        kelas: validKelas._id,
        $and: [
          {
            user: req.user.id,
          },
        ],
      });

      if (haveSubmitted) {
        return response(
          400,
          {},
          "Anda sudah melakukan permohonan pada kelas ini",
          res
        );
      }

      let valid = false;

      user.kelas.map((m) => {
        if (m.kelas.toHexString() == validKelas._id.toHexString()) {
          if (m.isDone == true) {
            return response(400, {}, "Anda sudah menyelesaikan kelas ini", res);
          }

          valid = true;
        }
      });

      if (valid) {
        const data = await ClassResolvementRequest.create({
          user: req.user.id,
          kelas: validKelas._id,
        });

        return response(
          201,
          data,
          "Permohonan penyelesaian kelas berhasil diajukan",
          res
        );
      } else {
        return response(400, {}, "Anda tidak terdaftar di kelas ini", res);
      }
    } catch (error) {
      console.log(error.message);

      return res
        .status(500)
        .json({ error: "Internal server error, coba lagi" });
    }
  },

  approveSubmitClassResolvement: async (req, res) => {
    try {
      let { id } = req.body;

      if (!id) {
        return response(400, {}, "Mohon isi id", res);
      }

      if (id.length == 1) {
        id = id[0];

        const valid = await ClassResolvementRequest.findById(id);

        if (!valid) {
          return response(404, {}, "Permohonan tidak ditemukan", res);
        }

        const kelasId = valid.kelas;

        const user = await userModel.findById(valid.user);

        let kelas = [];

        let chosenClass = await Kelas.findById(kelasId);

        user.kelas.map((m) => {
          if (m.kelas.toHexString() == kelasId.toHexString()) {
            kelas.push({
              kelas: m.kelas,
              status: m.status,
              isDone: true,
              _id: m._id,
              createdAt: m.createdAt,
              updatedAt: m.updatedAt,
            });
          } else {
            kelas.push(m);
          }
        });

        const data = await userModel.findByIdAndUpdate(
          valid.user,
          {
            kelas,
          },
          {
            new: true,
          }
        );

        await ClassResolvementRequest.findByIdAndDelete(id);

        await sendClassResolvementMail(
          user.email,
          chosenClass.nama,
          user.username
        );

        return response(
          200,
          data,
          "Permohonan penyelesaian kelas berhasil disetujui",
          res
        );
      } else {
        id.map(async (i) => {
          const valid = await ClassResolvementRequest.findById(i);

          if (!valid) {
            return response(404, {}, "Permohonan tidak ditemukan", res);
          }

          const kelasId = valid.kelas;

          const user = await userModel.findById(valid.user);

          let kelas = [];

          let chosenClass = await Kelas.findById(kelasId);

          user.kelas.map((m) => {
            if (m.kelas.toHexString() == kelasId.toHexString()) {
              kelas.push({
                kelas: m.kelas,
                status: m.status,
                isDone: true,
                _id: m._id,
                createdAt: m.createdAt,
                updatedAt: m.updatedAt,
              });
            } else {
              kelas.push(m);
            }
          });

          await userModel.findByIdAndUpdate(
            valid.user,
            {
              kelas,
            },
            {
              new: true,
            }
          );

          await ClassResolvementRequest.findByIdAndDelete(i);

          await sendClassResolvementMail(
            user.email,
            chosenClass.nama,
            user.username
          );
        });

        return response(
          200,
          {},
          "Permohonan penyelesaian kelas berhasil disetujui",
          res
        );
      }
    } catch (error) {
      console.log(error.message);

      return res
        .status(500)
        .json({ error: "Internal server error, coba lagi" });
    }
  },

  denySubmitClassResolvement: async (req, res) => {
    try {
      let { id } = req.body;

      if (!id) {
        return response(400, {}, "Mohon isi id", res);
      }

      if (id.length == 1) {
        id = id[0];

        const valid = await ClassResolvementRequest.findById(id);

        if (!valid) {
          return response(404, {}, "Permohonan tidak ditemukan", res);
        }

        await ClassResolvementRequest.findByIdAndDelete(id);
      } else {
        id.map(async (i) => {
          const valid = await ClassResolvementRequest.findById(i);

          if (!valid) {
            return response(404, {}, "Permohonan tidak ditemukan", res);
          }

          await ClassResolvementRequest.findByIdAndDelete(i);
        });
      }

      return response(
        200,
        {},
        "Permohonan penyelesaian kelas berhasil ditolak",
        res
      );
    } catch (error) {
      console.log(error.message);

      return res
        .status(500)
        .json({ error: "Internal server error, coba lagi" });
    }
  },

  deleteUser: async (req, res) => {
    const idUser = req.params.id;

    try {
      const hasMateri = await Materi.find({
        instruktur: idUser,
      });
      if (hasMateri.length > 0) {
        return response(
          400,
          {},
          "Tidak dapat menghapus user: user memiliki materi",
          res
        );
      }

      const user = await userModel.findByIdAndRemove(idUser);

      return response(200, user, "Berhasil delete user", res);
    } catch (error) {
      res.status(500).json({ error: "Internal server error, coba lagi" });
    }
  },

  getStatusPendingUser: async (req, res) => {
    try {
      const { user } = req.query;

      let ids = [];
      let len = 0;

      if (user) {
        const userData = await userModel.find();

        len = user.length;

        userData.map((u) => {
          if (u.name.substring(0, len) == user) {
            ids.push(u._id);
          }

          if (u.email.substring(0, len) == user) {
            ids.push(u._id);
          }
        });
      }

      let data = await userModel.find();

      if (user) {
        data = await userModel.find({
          _id: { $in: ids },
        });
      }

      const filtered = data.filter((val) => {
        return val.status === "pending";
      });
      response(200, filtered, "Berhasil get status pending user", res);
    } catch (error) {
      response(500, error.message, error.message, res);
    }
  },

  updateStatusUser: async (req, res) => {
    let { id, status } = req.body; //status yang ingin dirubah

    try {
      if (id.length == 1) {
        id = id[0];

        const result = await userModel.findOneAndUpdate(
          { _id: id },
          { status: status },
          { new: true }
        );

        await sendUserStatusMail(result.email, status, result.username);
      } else {
        id.map(async (i) => {
          const result = await userModel.findOneAndUpdate(
            { _id: i },
            { status: status },
            { new: true }
          );

          await sendUserStatusMail(result.email, status, result.username);
        });
      }

      response(200, result, "Berhasil ubah status user", res);
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

  getInstructor: async (req, res) => {
    const { id } = req.params;

    try {
      let data = await userModel.findById(id);

      if (!data) {
        return response(400, [], "data tidak ditemukan", res);
      } else if (data.role !== 2) {
        return response(400, [], "data tidak ditemukan", res);
      }

      data = await userModel
        .findById(id)
        .select("-password")
        .populate("rating", "rating comment createdAt");

      return response(200, data, "data ditemukan", res);
    } catch (error) {
      return response(500, [], error.message, res);
    }
  },

  getWithFilter: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);
      if (
        req.body.name != undefined &&
        req.body.name != null &&
        req.body.name.trim() != ""
      ) {
        req.body.name = { $regex: "^" + req.body.name, $options: "i" };
      }
      let totalData = await userModel.find({ ...req.body }).countDocuments();

      if (isPaginate === 0) {
        const data = await userModel.find({ ...req.body }).select("-password");

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
        .sort({ name: 1 })
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit);
      // .populate("kelas")

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
    const { email, username } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let check = await userModel.findOne({ email }).session(session);

      if (!check) {
        response(400, check, `User dengan email ${email} tidak ada!`, res);
        await session.abortTransaction();
        return;
      }

      check = await userModel.findOne({ username }).session(session);

      if (!check) {
        response(
          400,
          check,
          `User dengan username ${username} tidak ada!`,
          res
        );
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
