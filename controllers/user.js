const mongoose = require("mongoose");
const ClassResolvementRequest = require("../models/classResolvementRequest");
const Materi = require("../models/materi");
const userModel = require("../models/user");
const TestAnswer = require("../models/testAnswer");
const Test = require("../models/test");
const Sertifikat = require("../models/sertifikat");
const Kelas = require("../models/kelas");
const Kategori = require("../models/kategori");
const ratingModel = require("../models/rating");
const Nipp = require("../models/nipp");
const Absen = require("../models/absensiPeserta");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const response = require("../respons/response");
const tokenGenerator = require("../service/mail/tokenGenerator");
const {
  sendConfirmationEmail,
  sendUserStatusMail,
  sendClassResolvementMail,
} = require("../service/mail/config");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const Ranking = require("../models/ranking");
const { getInstructorClass } = require("../service");
const classEnrollmentLog = require("../models/classEnrollmentLog");
const EvaluationFormResult = require("../models/evaluationFormResult");
const { log } = require("console");
const RecentClass = require("../models/recentClass");

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

  dashboardCard: async (req, res) => {
    try {
      let kelas = await Kelas.find({
        status: {
          $ne: "deleted",
        },
      });

      let today = new Date();

      const startDate =
        req.query.startDate != "" && req.query.startDate
          ? moment(req.query.startDate).format("YYYY-MM-DD")
          : null;

      const endDate =
        req.query.endDate != "" && req.query.endDate
          ? moment(req.query.endDate).format("YYYY-MM-DD")
          : null;

      today = moment(today).format("YYYY-MM-DD");

      let finishedIds = [];

      let onGoingClass = 0;
      let finishedClass = 0;
      let ranking = "";
      let kelasIds = [];
      let userIds = [];

      let classCount = kelas.length;

      if (startDate) {
        classCount = 0;
      }

      if (req.user.role == 3) {
        const me = await userModel.findById(req.user.id);

        for (let i = 0; i < me.kelas.length; i++) {
          kelasIds.push(me.kelas[i].kelas);

          if (me.kelas[i].isDone) {
            finishedClass = finishedClass + 1;

            finishedIds.push(me.kelas[i].kelas);
          }
        }

        kelas = await Kelas.find({
          _id: { $in: kelasIds },
        });

        classCount = kelas.length;

        if (startDate) {
          classCount = 0;
        }

        kelasIds = [];

        kelas.map((k) => {
          if (startDate) {
            const finalSchedule = moment(
              k.jadwal[k.jadwal.length - 1].tanggal
            ).format("YYYY-MM-DD");

            const startSchedule = moment(k.jadwal[0].tanggal).format(
              "YYYY-MM-DD"
            );

            if (endDate) {
              if (
                moment(startSchedule).isSameOrAfter(startDate) &&
                moment(finalSchedule).isSameOrBefore(endDate)
              ) {
                if (finishedIds.length > 0) {
                  let none = false;

                  for (let i = 0; i < finishedIds.length; i++) {
                    if (k._id == finishedIds[i]) {
                      none = true;

                      break;
                    }
                  }

                  if (none) {
                    onGoingClass = onGoingClass + 1;
                    classCount = classCount + 1;

                    kelasIds.push(k._id);

                    k.peserta.map((p) => {
                      userIds.push(p.user);
                    });
                  }
                } else {
                  onGoingClass = onGoingClass + 1;
                  classCount = classCount + 1;

                  kelasIds.push(k._id);

                  k.peserta.map((p) => {
                    userIds.push(p.user);
                  });
                }
              }
            } else {
              if (
                moment(startSchedule).isSameOrAfter(startDate) &&
                moment(finalSchedule).isBefore(today)
              ) {
                if (finishedIds.length > 0) {
                  let none = false;

                  for (let i = 0; i < finishedIds.length; i++) {
                    if (k._id == finishedIds[i]) {
                      none = true;

                      break;
                    }
                  }

                  if (none) {
                    onGoingClass = onGoingClass + 1;
                    classCount = classCount + 1;

                    kelasIds.push(k._id);

                    k.peserta.map((p) => {
                      userIds.push(p.user);
                    });
                  }
                } else {
                  onGoingClass = onGoingClass + 1;
                  classCount = classCount + 1;

                  kelasIds.push(k._id);

                  k.peserta.map((p) => {
                    userIds.push(p.user);
                  });
                }
              }
            }
            if (
              moment(k.jadwal[k.jadwal.length - 1].tanggal).format(
                "YYYY-MM-DD"
              ) >= today
            ) {
              classCount = classCount + 1;
              kelasIds.push(k._id);

              k.peserta.map((p) => {
                userIds.push(p.user);
              });
            }
          } else {
            const schedule = moment(
              k.jadwal[k.jadwal.length - 1].tanggal
            ).format("YYYY-MM-DD");

            if (moment(schedule).isSameOrAfter(today)) {
              if (finishedIds.length > 0) {
                let none = false;

                for (let i = 0; i < finishedIds.length; i++) {
                  if (k._id == finishedIds[i]) {
                    none = true;

                    break;
                  }
                }

                if (none) {
                  onGoingClass = onGoingClass + 1;

                  k.peserta.map((p) => {
                    userIds.push(p.user);
                  });
                }
              } else {
                onGoingClass = onGoingClass + 1;

                k.peserta.map((p) => {
                  userIds.push(p.user);
                });
              }
            } else {
              finishedClass = finishedClass + 1;

              k.peserta.map((p) => {
                userIds.push(p.user);
              });
            }
          }
        });

        let answerCount = await TestAnswer.find({
          user: req.user._id,
        }).countDocuments();

        let answers = await TestAnswer.find({ user: req.user._id });

        const user = await userModel
          .find({
            role: 3,
            $and: [
              {
                _id: { $in: userIds },
              },
            ],
          })
          .countDocuments();

        if (startDate) {
          answerCount = await TestAnswer.find({
            kelas: { $in: kelasIds },
            $and: [
              {
                user: req.user._id,
              },
            ],
          }).countDocuments();

          answers = await TestAnswer.find({
            kelas: { $in: kelasIds },
            $and: [
              {
                user: req.user._id,
              },
            ],
          });
        }

        let score = 0;

        if (answerCount > 0) {
          answers.map((a) => {
            score = score + a.nilai;
          });

          score = score / answerCount;
        }

        personalRanking = await Ranking.find({ user: req.user_id });

        if (personalRanking.length > 0) {
          let accumulation = 0;

          personalRanking.map((p) => {
            accumulation = accumulation + p.ranking;
          });

          ranking = Math.floor(accumulation / personalRanking.length);
        }

        const data = {
          finishedClass,
          onGoingClass,
          score,
          classCount,
          userCount: user,
          ranking,
        };

        response(200, data, "get user dashboard card", res);
      } else if (req.user.role < 2) {
        if (startDate) {
          classCount = 0;
        }

        kelas.map((k) => {
          if (startDate) {
            const finalSchedule = moment(
              k.jadwal[k.jadwal.length - 1].tanggal
            ).format("YYYY-MM-DD");

            const startSchedule = moment(k.jadwal[0].tanggal).format(
              "YYYY-MM-DD"
            );

            if (endDate) {
              if (
                moment(startSchedule).isSameOrAfter(startDate) &&
                moment(finalSchedule).isSameOrBefore(endDate)
              ) {
                if (k.status == "ended") {
                  finishedClass = finishedClass + 1;

                  classCount = classCount + 1;
                } else {
                  onGoingClass = onGoingClass + 1;

                  classCount = classCount + 1;

                  kelasIds.push(k._id);

                  k.peserta.map((p) => {
                    userIds.push(p.user);
                  });
                }
              }
            } else {
              if (
                moment(startSchedule).isSameOrAfter(startDate) &&
                moment(finalSchedule).isBefore(today)
              ) {
                if (k.status == "ended") {
                  finishedClass = finishedClass + 1;

                  classCount = classCount + 1;
                } else {
                  onGoingClass = onGoingClass + 1;

                  classCount = classCount + 1;

                  kelasIds.push(k._id);

                  k.peserta.map((p) => {
                    userIds.push(p.user);
                  });
                }
              }
            }
          } else {
            if (k.status == "ended") {
              finishedClass = finishedClass + 1;
            } else {
              onGoingClass = onGoingClass + 1;

              kelasIds.push(k._id);
            }
          }
        });

        let answerCount = await TestAnswer.find().countDocuments();

        let answers = await TestAnswer.find();

        const user = await userModel
          .find({
            role: 3,
            $and: [
              {
                _id: { $in: userIds },
              },
            ],
          })
          .countDocuments();

        if (startDate) {
          answerCount = await TestAnswer.find({
            kelas: { $in: kelasIds },
          }).countDocuments();

          answers = await TestAnswer.find({
            kelas: { $in: kelasIds },
          });
        }

        let score = 0;

        if (answerCount > 0) {
          answers.map((a) => {
            score = score + a.nilai;
          });

          score = score / answerCount;
        }

        const data = {
          finishedClass,
          onGoingClass,
          score,
          classCount,
          userCount: user,
          ranking: "",
        };

        response(200, data, "get user dashboard card", res);
      } else {
        let newStudents = 0;
        let studentTotal = 0;

        kelasIds = await getInstructorClass(req.user.id);

        kelas = await Kelas.find({
          _id: { $in: kelasIds },
        });

        classCount = kelas.length;

        kelas = await Kelas.find({ _id: { $in: kelasIds } });

        kelasIds = [];

        kelas.map((k) => {
          if (startDate) {
            const finalSchedule = moment(
              k.jadwal[k.jadwal.length - 1].tanggal
            ).format("YYYY-MM-DD");

            const startSchedule = moment(k.jadwal[0].tanggal).format(
              "YYYY-MM-DD"
            );

            if (endDate) {
              if (
                moment(startSchedule).isSameOrAfter(startDate) &&
                moment(finalSchedule).isSameOrBefore(endDate)
              ) {
                if (k.status == "ended") {
                  finishedClass = finishedClass + 1;
                } else {
                  kelasIds.push(k._id);
                }
              }
            } else {
              if (
                moment(startSchedule).isSameOrAfter(startDate) &&
                moment(finalSchedule).isBefore(today)
              ) {
                if (k.status == "ended") {
                  finishedClass = finishedClass + 1;
                } else {
                  kelasIds.push(k._id);
                }
              }
            }
          } else {
            if (k.status == "ended") {
              finishedClass = finishedClass + 1;
            } else {
              kelasIds.push(k._id);
            }
          }
        });

        kelas = await Kelas.find({ _id: { $in: kelasIds } });

        await Promise.all(
          kelas.map((k) => {
            studentTotal = studentTotal + k.peserta.length;
          })
        );

        let lastWeek;

        if (startDate) {
          today = startDate;

          lastWeek = moment(req.query.startDate)
            .subtract(7, "days")
            .format("YYYY-MM-DD");
        } else {
          today = new Date();

          lastWeek = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 7
          );

          today = moment(today).format("YYYY-MM-DD");
          lastWeek = moment(lastWeek).format("YYYY-MM-DD");
        }

        const log = await classEnrollmentLog.find({
          kelas: { $in: kelasIds },
        });

        if (log.length > 0) {
          log.map((l) => {
            if (
              moment(l.createdAt).format("YYYY-MM-DD") >= lastWeek &&
              moment(l.createdAt).format("YYYY-MM-DD") <= today
            ) {
              newStudents = newStudents + 1;
            }
          });
        }

        const data = {
          studentTotal,
          finishedClass,
          classTotal: kelas.length,
          newStudents,
        };

        response(200, data, "get user dashboard card", res);
      }
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  ubahStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const user = await userModel.findByIdAndUpdate(
        id,
        { status },
        {
          new: true,
        }
      );
      response(200, user, "Berhasil update status user", res);
    } catch (error) {
      res.status(500).json({ error: "Internal server error, coba lagi" });
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
        // link_cv,
        phone,
        tipe,
      } = req.fields;
      const picture = req.files["userImage"];
      const cvFile = req.files["cv"];
      let link_cv_user = "";
      let userImage = "";
      const id_cv = Math.floor(Math.random() * 49829482938);
      const id_image = Math.floor(Math.random() * 49829482938);
      const today = new Date().toISOString().slice(0, 10);
      if (picture !== undefined) {
        const folderImage = path.join(
          __dirname,
          "..",
          "upload",
          "profile-image",
          today
        );

        await fs.promises.mkdir(folderImage, { recursive: true });

        let ext;

        if (picture.type == "image/png") {
          ext = "png";
        } else if (picture.type == "image/jpg") {
          ext = "jpg";
        } else if (picture.type == "image/jpeg") {
          ext = "jpeg";
        }

        const newPicturePath = folderImage + `/profile-image${id_image}.${ext}`;

        var oldPicturePath = picture.path;

        fs.promises.copyFile(oldPicturePath, newPicturePath, 0, function (err) {
          if (err) throw err;
        });

        userImage = `upload/profile-image/${today}/profile-image${id_image}.${ext}`;
      }

      if (cvFile !== undefined) {
        const folderCV = path.join(__dirname, "..", "upload", "cv", today);

        await fs.promises.mkdir(folderCV, { recursive: true });

        // console.log(folderCV.type);

        const newCVPath = folderCV + `/cv${id_cv}.pdf`;

        var oldCVPath = cvFile.path;

        fs.promises.copyFile(oldCVPath, newCVPath, 0, function (err) {
          if (err) throw err;
        });

        link_cv_user = `upload/cv/${today}/cv${id_cv}.pdf`;
      }

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

      const passwordHash = bcrypt.hashSync(password, 10, (err, hash) => {
        if (err) {
          console.log(err);
        }
      });

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
        link_cv: link_cv_user,
        userImage,
        phone,
        userType: tipe,
      });

      await user.save();

      response(200, user, "Register berhasil", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },

  register: async (req, res) => {
    try {
      const {
        name,
        email,
        username,
        password,
        is_enrollment,
        kelas,
        nipp,
        phone,
        instansi,
      } = req.body;

      // const cekUser = await userModel.findOne({
      //   $or: [{ username }, { email }],
      // });
      const cekUser = await userModel.findOne({
        email,
        $and: [
          {
            role: 3,
          },
        ],
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
        nipp,
        phone,
        instansi,
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
        username,
      });

      if (user) {
        // const token = jwt.sign({ id: user._id, role: user.role }, secret_key);

        // return response(200, { token, user }, "Login berhasil", res);
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

  getSingleUserPersonal: async (req, res) => {
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

  getDetailedUser: async (req, res) => {
    try {
      const id = req.params.id;

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
    const picture = req.files["userImage"];
    const cvFile = req.files["cv"];

    // console.log(picture, cvFile);
    // console.log(req.fields);

    let body;

    body = {
      ...req.fields,
    };

    const today = new Date().toISOString().slice(0, 10);

    const oldData = await userModel.findById(idUser);

    if (picture !== undefined) {
      const folderImage = path.join(
        __dirname,
        "..",
        "upload",
        "profile-image",
        today
      );

      await fs.promises.mkdir(folderImage, { recursive: true });

      let ext;

      if (picture.type == "image/png") {
        ext = "png";
      } else if (picture.type == "image/jpg") {
        ext = "jpg";
      } else if (picture.type == "image/jpeg") {
        ext = "jpeg";
      }

      const newPicturePath = folderImage + `/profile-image${idUser}.${ext}`;

      var oldPicturePath = picture.path;

      fs.promises.copyFile(oldPicturePath, newPicturePath, 0, function (err) {
        if (err) throw err;
      });

      body.userImage = `upload/profile-image/${today}/profile-image${idUser}.${ext}`;
    } else {
      body.userImage = oldData.userImage;
    }

    if (cvFile !== undefined) {
      const folderCV = path.join(__dirname, "..", "upload", "cv", today);

      await fs.promises.mkdir(folderCV, { recursive: true });

      // console.log(folderCV.type);

      const newCVPath = folderCV + `/cv${idUser}.pdf`;

      var oldCVPath = cvFile.path;

      fs.promises.copyFile(oldCVPath, newCVPath, 0, function (err) {
        if (err) throw err;
      });

      body.link_cv = `upload/cv/${today}/cv${idUser}.pdf`;
    } else {
      body.link_cv = oldData.link_cv;
    }

    body.bidang = body.bidang ? JSON.parse(body.bidang) : [];
    body.pendidikan = body.pendidikan ? JSON.parse(body.pendidikan) : [];
    body.kompetensi = body.kompetensi ? JSON.parse(body.kompetensi) : [];
    body.userType = body.tipe;

    try {
      const user = await userModel.findByIdAndUpdate(idUser, body, {
        new: true,
      });
      response(200, user, "Berhasil update user", res);
    } catch (error) {
      res.status(500).json({ error: "Internal server error, coba lagi" });
    }
  },

  saveRecentClass: async function (req, res) {
    try {
      const { id, idUser } = req.params;
      const check = await RecentClass.findOne({
        user: idUser,
        $and: [
          {
            kelas: id,
          },
        ],
      });

      if (check) {
        const data = await RecentClass.find({
          user: idUser,
        })
          .populate("kelas")
          .sort({ number: 1 });

        return data;
      }

      const first = await RecentClass.findOne({
        number: 1,
        $and: [
          {
            user: idUser,
          },
        ],
      });

      const second = await RecentClass.findOne({
        number: 2,
        $and: [
          {
            user: idUser,
          },
        ],
      });

      const third = await RecentClass.findOne({
        number: 3,
        $and: [
          {
            user: idUser,
          },
        ],
      });

      const fourth = await RecentClass.findOne({
        number: 4,
        $and: [
          {
            user: idUser,
          },
        ],
      });

      if (first) {
        await RecentClass.findByIdAndUpdate(first._id, {
          number: 2,
        });
      }

      if (second) {
        await RecentClass.findByIdAndUpdate(second._id, {
          number: 3,
        });
      }

      if (third) {
        await RecentClass.findByIdAndUpdate(third._id, {
          number: 4,
        });
      }

      if (fourth) {
        await RecentClass.findByIdAndDelete(fourth._id);
      }

      await RecentClass.create({
        number: 1,
        kelas: id,
        user: idUser,
      });
      response(200, {}, "Berhasil update recent class", res);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error, coba lagi", mes: error });
    }
  },

  getCertificate: async (req, res) => {
    try {
      const id = req.user.id;
      const { isThere } = req.query;

      const kelasName =
        req.query.kelas && req.query.kelas.length > 0 ? req.query.kelas : "";

      const user = await userModel.findById(id);

      let data = [];
      let kelas = [];

      if (req.user.role == 3) {
        if (user.kelas.length > 0) {
          user.kelas.map((m) => {
            if (
              (m.isDone == true && parseInt(isThere) != 3) ||
              parseInt(isThere) == 3
            ) {
              kelas.push(m.kelas);
            }
          });
        }

        if (kelas.length > 0) {
          for (let i = 0; i < kelas.length; i++) {
            const detailKelas = await Kelas.findById(kelas[i]);

            if (kelasName) {
              if (
                !detailKelas.nama
                  .toLowerCase()
                  .includes(kelasName.toLowerCase())
              ) {
                continue;
              }
            }

            const evaluated = await EvaluationFormResult.findOne({
              user: id,
              kelas: kelas[i],
            });

            if (parseInt(isThere) === 3) {
              const sertifikat = await Sertifikat.findById(
                detailKelas.desainSertifikat?.peserta
              );
              data.push({
                sertifikat,
                kelas: detailKelas?.nama,
                jadwal: detailKelas?.jadwal,
                idKelas: detailKelas?._id,
              });
            }
            if (!evaluated) {
              continue;
            }
            const sertifikat = await Sertifikat.findById(
              detailKelas.desainSertifikat?.peserta
            );
            if (
              (parseInt(isThere) === 0 && sertifikat !== null) ||
              (parseInt(isThere) === 1 && sertifikat === null)
            ) {
              data.push({
                sertifikat,
                kelas: detailKelas?.nama,
                jadwal: detailKelas?.jadwal,
                idKelas: detailKelas?._id,
              });
            }
          }
        }
      } else if (req.user.role == 2) {
        const dataKelas = await Kelas.find({
          status: "ended",
        }).populate("materi");

        dataKelas.map((k) => {
          if (k.materi) {
            for (let i = 0; i < k.materi.length; i++) {
              for (let j = 0; j < k.materi[i].instruktur.length; j++) {
                if (k.materi[i].instruktur[j] == req.user.id) {
                  kelas.push(k._id);
                }
              }
            }
          }
        });

        kelas = kelas.filter((value, index, self) => {
          return self.indexOf(value) === index;
        });

        if (kelas.length > 0) {
          for (let i = 0; i < kelas.length; i++) {
            const detailKelas = await Kelas.findById(kelas[i]);

            if (kelasName) {
              if (
                !detailKelas.nama
                  .toLowerCase()
                  .includes(kelasName.toLowerCase())
              ) {
                continue;
              }
            }

            // const today = moment().format("ddd MMM DD YYYY");

            // const last = moment(
            //   detailKelas.jadwal[detailKelas.jadwal.length - 1].tanggal
            // ).format("ddd MMM DD YYYY");

            // if (moment(today).isBefore(last)) {
            //   continue;
            // }

            const sertifikat = await Sertifikat.findById(
              detailKelas.desainSertifikat?.instruktur
            );

            if (
              (parseInt(isThere) === 0 && sertifikat !== null) ||
              (parseInt(isThere) === 1 && sertifikat === null)
            ) {
              data.push({
                sertifikat,
                kelas: detailKelas?.nama,
                jadwal: detailKelas?.jadwal,
                idKelas: detailKelas?._id,
              });
            }
          }
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
      const user = req.query.user;
      const kelas = req.query.kelas;

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

  classResolvemntClassList: async (req, res) => {
    try {
      const request = await ClassResolvementRequest.find();

      let ids = [];

      request.map((r) => {
        ids.push(r.kelas);
      });

      const data = await Kelas.find({
        _id: { $in: ids },
      }).select("nama");

      return response(200, data, "List Kelas", res);
    } catch (error) {
      console.log(error.message);

      return res
        .status(500)
        .json({ error: "Internal server error, coba lagi" });
    }
  },

  submitClassResolvement: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { kelas } = req.body;

      if (!kelas) {
        return response(400, {}, "Mohon isi kelas", res);
      }

      const validKelas = await Kelas.findOne({
        slug: kelas,
      }).session(session);

      if (!validKelas) {
        return response(404, {}, "Kelas tidak ditemukan", res);
      }

      const user = await userModel.findById(req.user.id).session(session);

      const haveSubmitted = await ClassResolvementRequest.findOne({
        kelas: validKelas._id,
        $and: [
          {
            user: req.user.id,
          },
        ],
      }).session(session);

      if (haveSubmitted) {
        response(
          400,
          {},
          "Anda sudah melakukan permohonan pada kelas ini",
          res
        );

        await session.abortTransaction();

        return;
      }

      let valid = false;

      user.kelas.map(async (m) => {
        if (m.kelas.toHexString() == validKelas._id.toHexString()) {
          if (m.isDone == true) {
            response(400, {}, "Anda sudah menyelesaikan kelas ini", res);

            await session.abortTransaction();

            return;
          }

          valid = true;
        }
      });

      if (valid) {
        let materis = [];
        const absenPeserta = await Absen.find({
          user: req.user.id,
          kelas: validKelas._id,
        });
        if (absenPeserta == null || absenPeserta.length == 0) {
          return response(400, {}, "Anda Belum Absen", res);
        }

        validKelas.materi.map((m) => {
          materis.push(m);
        });

        if (materis) {
          for (let i = 0; i < materis.length; i++) {
            const materi = await Materi.findById(materis[i]).session(session);

            if (materi) {
              if (materi.test) {
                if (
                  materi.test.pre != "" &&
                  materi.test.pre &&
                  materi.test.pre != undefined
                ) {
                  const preTest = await Test.findById(materi.test.pre).session(
                    session
                  );

                  if (preTest) {
                    const haveAnsweredPre = await TestAnswer.findOne({
                      user: req.user.id,
                      $and: [
                        {
                          test: materi.test.pre,
                        },
                        {
                          class: validKelas._id,
                        },
                      ],
                    }).session(session);

                    if (!haveAnsweredPre) {
                      response(
                        400,
                        {},
                        "Anda belum mengerjakan pre test pada kelas ini",
                        res
                      );

                      await session.abortTransaction();

                      return;
                    }
                  }
                }

                if (
                  materi.test.post != "" &&
                  materi.test.post &&
                  materi.test.post != undefined
                ) {
                  const postTest = await Test.findById(
                    materi.test.post
                  ).session(session);

                  if (postTest) {
                    const haveAnsweredPost = await TestAnswer.findOne({
                      user: req.user.id,
                      $and: [
                        {
                          test: materi.test.post,
                        },
                        {
                          class: validKelas._id,
                        },
                      ],
                    }).session(session);

                    if (!haveAnsweredPost) {
                      response(
                        400,
                        {},
                        "Anda belum mengerjakan post test pada kelas ini",
                        res
                      );

                      await session.abortTransaction();

                      return;
                    }
                  }
                }
              }

              for (let j = 0; j < materi.items.length; j++) {
                if (materi.items[j].hasOwnProperty("quiz")) {
                  const quiz = await Test.findById(
                    materi.items[j].quiz
                  ).session(session);

                  if (quiz) {
                    const haveAnswered = await TestAnswer.findOne({
                      user: req.user.id,
                      $and: [
                        {
                          test: materi.items[j].quiz,
                        },
                        {
                          class: validKelas._id,
                        },
                      ],
                    }).session(session);

                    if (!haveAnswered) {
                      response(
                        400,
                        {},
                        "Anda belum mengerjakan semua quiz yang tersedia",
                        res
                      );

                      await session.abortTransaction();

                      return;
                    }
                  }
                }
              }
            }
          }
        }

        const data = await ClassResolvementRequest.create({
          user: req.user.id,
          kelas: validKelas._id,
        });

        await session.commitTransaction();

        response(
          201,
          data,
          "Permohonan penyelesaian kelas berhasil diajukan",
          res
        );
      } else {
        response(400, {}, "Anda tidak terdaftar di kelas ini", res);

        await session.abortTransaction();

        return;
      }
    } catch (error) {
      console.log(error);

      res.status(500).json({ error: "Internal server error, coba lagi" });

      await session.abortTransaction();
    } finally {
      session.endSession();
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
      // console.log(hasMateri);
      if (hasMateri.length > 0) {
        return response(
          400,
          {},
          "Tidak dapat menghapus user: user memiliki materi",
          res
        );
      }

      const user = await userModel.findByIdAndRemove(idUser);
      if (
        user.userImage != "" &&
        user.userImage != null &&
        user.userImage != undefined
      ) {
        fs.unlinkSync(user.userImage);
      }
      if (
        user.link_cv != "" &&
        user.link_cv != null &&
        user.link_cv != undefined
      ) {
        fs.unlinkSync(user.link_cv);
      }

      return response(200, user, "Berhasil delete user", res);
    } catch (error) {
      console.log(error);
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
          { _id: id, role: 3 },
          { status: status },
          { new: true }
        );

        response(200, result, "Berhasil ubah status user", res);
      } else {
        id.map(async (i) => {
          await userModel.findOneAndUpdate(
            { _id: i, role: 3 },
            { status: status },
            { new: true }
          );
        });

        response(200, "Berhasil ubah status user", res);
      }
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

      const { name } = req.query;

      let ids = [];

      let data;

      if (!isPaginate) {
        data = await userModel
          .find({ ...req.body })
          .sort({ name: 1 })
          .select("-password");

        if (name) {
          let len = name.length;

          data.map(async (u) => {
            if (u.name.substring(0, len).toLowerCase() == name.toLowerCase()) {
              ids.push(u._id);
            }
          });

          data = await userModel
            .find({ _id: { $in: ids } })
            .sort({ name: 1 })
            .select("-password");
        }

        result = {
          data: data,
          "total data": data.length,
        };
        response(200, result, "get user", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      data = await userModel
        .find({ ...req.body })
        .sort({ name: 1 })
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit);
      // .populate("kelas")

      let totalData = await userModel.find({ ...req.body }).countDocuments();

      if (name) {
        data = await userModel
          .find({ ...req.body })
          .sort({ name: 1 })
          .select("-password");

        let len = name.length;

        data.map(async (u) => {
          if (u.name.substring(0, len).toLowerCase() == name.toLowerCase()) {
            // console.log(u.name);
            ids.push(u._id);
          }
        });

        data = await userModel
          .find({ _id: { $in: ids } })
          .sort({ name: 1 })
          .select("-password")
          .skip((page - 1) * limit)
          .limit(limit);

        totalData = await userModel
          .find({ _id: { $in: ids } })
          .countDocuments();
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

  adminList: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);
      if (
        req.body.name != undefined &&
        req.body.name != null &&
        req.body.name.trim() != ""
      ) {
        req.body.name = { $regex: "^" + req.body.name, $options: "i" };
      }
      let totalData = await userModel
        .find({
          ...req.body,
          $and: [
            {
              role: 1,
            },
          ],
        })
        .countDocuments();

      if (isPaginate === 0) {
        const data = await userModel
          .find({
            ...req.body,
            $and: [
              {
                role: 1,
              },
            ],
          })
          .select("-password");

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
        .find({
          ...req.body,
          $and: [
            {
              role: 1,
            },
          ],
        })
        .sort({ name: 1 })
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit);
      // .populate("kelas")

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get admin user", res);
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
        .populate({
          path: "kelas.kelas",
          match: { status: { $ne: "deleted" } },
        })
        .select("kelas")
        .sort({ "kelas.createdAt": 1 });

      // let ids = [];

      // get.kelas.map((g) => {
      //   ids.push(g.kelas);
      // });

      // get = await Kelas.find({
      //   _id: {
      //     $in: ids,
      //   },
      //   $and: [
      //     {
      //       status: { $ne: "deleted" },
      //     },
      //   ],
      // }).sort({ createdAt: -1 });

      get = await Kategori.populate(get, {
        path: "kategori",
      });

      // get = {
      //   id,
      //   kelas: get,
      // };

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

  importData: async (req, res) => {
    try {
      const csvFile = req.files["csv"];

      if (!csvFile || csvFile == undefined) {
        return response(500, {}, "Mohon upload file csv", res);
      }

      if (csvFile.type !== "text/csv") {
        return response(500, {}, "Mohon upload file csv", res);
      }

      const folder = path.join(__dirname, "..", "upload", "imports");

      if (!fs.existsSync(folder)) {
        await fs.promises.mkdir(folder, { recursive: true });
      }

      const oldPath = csvFile.path;

      const name = `data.csv`;

      const newPath = folder + `/${name}`;

      await fs.promises.copyFile(oldPath, newPath, 0, function (err) {
        if (err) throw err;
      });

      const data = fs
        .readFileSync("upload/imports/data.csv")
        .toString()
        .split("\n")
        .map((e) => e.trim())
        .map((e) => e.split(";").map((e) => e.trim()));

      // for (let i = 1; i < data.length; i++) {
      //   const checkUsername = await userModel.findOne({
      //     username: data[i][5],
      //   });

      //   if (checkUsername) {
      //     continue
      // return response(
      //   400,
      //   {
      //     username: data[i][5],
      //   },
      //   "Username sudah terdaftar",
      //   res
      // );
      // }

      // const checkEmail = await userModel.findOne({
      //   email: data[i][4],
      // });

      //   if (checkEmail) {
      //     return response(
      //       400,
      //       {
      //         email: data[i][4],
      //       },
      //       "Username sudah terdaftar",
      //       res
      //     );
      //   }
      // }

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] != "") {
          const checkUsername = await userModel.findOne({
            username: data[i][5],
          });

          if (checkUsername != null) {
            continue;
            // return response(
            //   400,
            //   {
            //     username: data[i][5],
            //   },
            //   "Username sudah terdaftar",
            //   res
            // );
          }
          const salt = bcrypt.genSaltSync(10);
          const password = bcrypt.hashSync(data[i][6], salt);

          await userModel.create({
            name: data[i][1],
            nipp: data[i][2],
            instansi: data[i][3],
            email: data[i][4],
            username: data[i][5],
            password: password,
            userType: data[i][7],
          });
        }
      }

      fs.rmSync(folder, { recursive: true });

      return response(201, data.length, "import data sukses", res);
    } catch (error) {
      console.log(error);
      res.json({
        message: error.message,
        data: [],
      });
    }
  },
  hapusCV: async function (req, res) {
    const { id } = req.params;
    try {
      const user = await userModel.findOne({ _id: id });
      fs.unlink(user.link_cv, (err) => {
        if (err) {
          return response(500, err, err, res);
        }
      });
      await userModel.findOneAndUpdate(
        { _id: id },
        { link_cv: "" },
        { new: true }
      );
      return response(200, null, "berhasil hapus cv", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },
};
