const mongoose = require("mongoose");
const KelasModel = require("../models/kelas");
const UserModel = require("../models/user");
const MateriModel = require("../models/materi");
const Absensi = require("../models/absensiPeserta");
const Test = require("../models/test");
const TestAnswer = require("../models/testAnswer");
const calonPesertaSchema = require("../models/calonpeserta");
const RecentClass = require("../models/recentClass");
const response = require("../respons/response");
const moment = require("moment");
const _ = require("lodash");
const { default: axios } = require("axios");
const { sendClassEnrollmentMail } = require("../service/mail/config");
const { paginateArray, getInstructorClass } = require("../service");
const Ranking = require("../models/ranking");
const classEnrollmentLog = require("../models/classEnrollmentLog");
const EvaluationFormResult = require("../models/evaluationFormResult");

module.exports = {
  getAllKelas: async (req, res) => {
    try {
      const halaman = parseInt(req.query.halaman) || 1;
      const batas = parseInt(req.query.batas) || 5;

      const { userType } = req.query;

      const fromDate = req.query.fromDate
        ? req.query.fromDate + "T00:00:00.000Z"
        : null;

      const fromDate2 = fromDate
        ? moment(req.query.fromDate).format("ddd MMM DD YYYY") +
          "07:00:00 GMT+0700 (Western Indonesia Time)"
        : null;

      const toDate = req.query.toDate
        ? req.query.toDate + "T00:00:00.000Z" + "T00:00:00.000Z"
        : null;

      const toDate2 = toDate
        ? moment(req.query.toDate).format("ddd MMM DD YYYY") +
          "07:00:00 GMT+0700 (Western Indonesia Time)"
        : null;

      const date1 = moment().format("ddd MMM DD YYYY");

      let ids = [];

      let kelas = await KelasModel.find({
        status: {
          $ne: "deleted",
        },
      });

      kelas.map(async (k) => {
        let date = k.jadwal[k.jadwal.length - 1].tanggal.replace(
          " 07:00:00 GMT+0700 (Western Indonesia Time)",
          ""
        );

        date = date.replace("T00:00:00.000Z", "");

        date = moment(date).format("ddd MMM DD YYYY");

        if (date == date1) {
          ids.push(k._id);
        } else if (moment(date).isAfter(date1)) {
          ids.push(k._id);
        }
      });

      let data = await KelasModel.find({
        _id: {
          $in: ids,
        },
        $and: [
          {
            status: {
              $ne: "deleted",
            },
          },
        ],
      })
        .skip((halaman - 1) * batas)
        .limit(batas)
        .populate("materi kategori trainingMethod")
        .sort({ createdAt: -1 });

      let totalData = data.length;

      if (userType || fromDate || toDate) {
        let ids = [];

        let kelas = await KelasModel.find({
          status: {
            $ne: "deleted",
          },
        });

        kelas.map(async (k) => {
          const date = new Date(
            k.jadwal[k.jadwal.length - 1].tanggal
          ).valueOf();

          if (date >= date1) {
            ids.push(k._id);
          }
        });

        kelas = await KelasModel.find({
          _id: {
            $in: ids,
          },
        });

        ids = [];

        if (userType) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.peserta.length; i++) {
                const user = await UserModel.findById(k.peserta[i].user);

                if (user && user.userType == userType) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        }

        if (fromDate) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.jadwal.length; i++) {
                if (k.jadwal[i].tanggal >= fromDate) {
                  ids.push(k._id);

                  break;
                } else if (k.jadwal[i].tanggal >= fromDate2) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        }

        if (toDate) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.jadwal.length; i++) {
                if (k.jadwal[i].tanggal <= toDate) {
                  ids.push(k._id);

                  break;
                } else if (k.jadwal[i].tanggal <= toDate2) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        }

        data = await KelasModel.find({
          _id: { $in: ids },
          $and: [
            {
              status: {
                $ne: "deleted",
              },
            },
          ],
        })
          .skip((halaman - 1) * batas)
          .limit(batas)
          .populate("materi kategori trainingMethod")
          .sort({ createdAt: -1 });

        totalData = data.length;
      }

      for (const kelas of data) {
        for (let i = 0; i < kelas.peserta.length; i++) {
          const peserta = kelas.peserta[i];
          const userData = await UserModel.findOne({
            _id: peserta.user,
          });
          if (userData) {
            kelas.peserta[i].user = userData;
          }
        }
      }

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "berhasil Get all kelas", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },

  getAllKelasAdmin: async (req, res) => {
    try {
      const halaman = parseInt(req.query.halaman) || 1;
      const batas = parseInt(req.query.batas) || 5;

      const { userType } = req.query;

      const fromDate = req.query.fromDate
        ? req.query.fromDate + "T00:00:00.000Z"
        : null;

      const fromDate2 = fromDate
        ? moment(req.query.fromDate).format("ddd MMM DD YYYY") +
          "07:00:00 GMT+0700 (Western Indonesia Time)"
        : null;

      const toDate = req.query.toDate
        ? req.query.toDate + "T00:00:00.000Z" + "T00:00:00.000Z"
        : null;

      const toDate2 = toDate
        ? moment(req.query.toDate).format("ddd MMM DD YYYY") +
          "07:00:00 GMT+0700 (Western Indonesia Time)"
        : null;

      const date1 = moment().format("ddd MMM DD YYYY");

      let ids = [];

      let kelas = await KelasModel.find({
        status: {
          $ne: "deleted",
        },
      });

      let data = await KelasModel.find({
        status: {
          $ne: "deleted",
        },
      })
        .skip((halaman - 1) * batas)
        .limit(batas)
        .populate("materi kategori trainingMethod")
        .sort({ createdAt: -1 });

      if (req.user.role > 1) {
        kelas.map(async (k) => {
          let date = k.jadwal[k.jadwal.length - 1].tanggal.replace(
            " 07:00:00 GMT+0700 (Western Indonesia Time)",
            ""
          );

          date = date.replace("T00:00:00.000Z", "");

          date = moment(date).format("ddd MMM DD YYYY");

          if (date == date1) {
            ids.push(k._id);
          } else if (moment(date).isAfter(date1)) {
            ids.push(k._id);
          }
        });

        data = await KelasModel.find({
          _id: {
            $in: ids,
          },
          $and: [
            {
              status: {
                $ne: "deleted",
              },
            },
          ],
        })
          .skip((halaman - 1) * batas)
          .limit(batas)
          .populate("materi kategori trainingMethod")
          .sort({ createdAt: -1 });
      }

      let totalData = data.length;

      if (userType || fromDate || toDate) {
        let ids = [];

        let kelas = await KelasModel.find({
          status: {
            $ne: "deleted",
          },
        });

        if (req.user.role > 1) {
          kelas.map(async (k) => {
            const date = new Date(
              k.jadwal[k.jadwal.length - 1].tanggal
            ).valueOf();

            if (date >= date1) {
              ids.push(k._id);
            }
          });

          kelas = await KelasModel.find({
            _id: {
              $in: ids,
            },
          });

          ids = [];
        }

        if (userType) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.peserta.length; i++) {
                const user = await UserModel.findById(k.peserta[i].user);

                if (user && user.userType == userType) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        }

        if (fromDate) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.jadwal.length; i++) {
                if (k.jadwal[i].tanggal >= fromDate) {
                  ids.push(k._id);

                  break;
                } else if (k.jadwal[i].tanggal >= fromDate2) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        }

        if (toDate) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.jadwal.length; i++) {
                if (k.jadwal[i].tanggal <= toDate) {
                  ids.push(k._id);

                  break;
                } else if (k.jadwal[i].tanggal <= toDate2) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        }

        data = await KelasModel.find({
          _id: { $in: ids },
          $and: [
            {
              status: {
                $ne: "deleted",
              },
            },
          ],
        })
          .skip((halaman - 1) * batas)
          .limit(batas)
          .populate("materi kategori trainingMethod")
          .sort({ createdAt: -1 });

        totalData = data.length;
      }

      for (const kelas of data) {
        for (let i = 0; i < kelas.peserta.length; i++) {
          const peserta = kelas.peserta[i];
          const userData = await UserModel.findOne({
            _id: peserta.user,
          });
          if (userData) {
            kelas.peserta[i].user = userData;
          }
        }
      }

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "berhasil Get all kelas", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },

  getAbsensi: async (req, res) => {
    try {
      const { kelas } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const targetClass = await KelasModel.findById(kelas);

      if (!targetClass) {
        return response(400, {}, "kelas tidak ditemukan", res);
      }

      let data = [];

      let userIds = [];

      targetClass.peserta.map((p) => {
        userIds.push(p.user);
      });

      if (userIds.length > 0) {
        data = [];

        const user = await UserModel.find({
          _id: { $in: userIds },
        });

        await Promise.all(
          user.map(async (u) => {
            let absenBox = [];

            const absen = await Absensi.find({
              user: u._id,
              $and: [
                {
                  status: {
                    $in: ["Absen Masuk", "ABSEN MULAI", "hadir", "masuk"],
                  },
                },
              ],
            });

            if (absen.length > 0) {
              for (let i = 0; i < targetClass.jadwal.length; i++) {
                for (let j = 0; j < absen.length; j++) {
                  absenBox.push({
                    tanggal: moment(targetClass.jadwal[i].tanggal).format(
                      "YYYY-MM-DD"
                    ),
                    status: absen[j].status,
                  });
                }
              }
            } else {
              targetClass.jadwal.map((j) => {
                absenBox.push({
                  tanggal: moment(j.tanggal).format("YYYY-MM-DD"),
                  status: "tidak masuk",
                });
              });
            }

            data.push({
              idUser: u._id,
              idKelas: kelas,
              name: u.name,
              nipp: u.nipp,
              userType: u.userType == 1 ? "Internal" : "External",
              kelas: targetClass.nama,
              absen: absenBox,
            });
          })
        );
      }

      const totalData = data.length;

      data = paginateArray(data, limit, page);

      const finalResult = {
        data,
        page,
        limit,
        totalData,
        datalength: data.length,
      };

      return response(200, finalResult, "get absensi", res);
    } catch (error) {
      console.log(error);
      return response(500, error, error.message, res);
    }
  },

  getTodayClass: async (req, res) => {
    try {
      let { startDate, endDate } = req.query;

      var today = moment().format("MMM DD YYYY");

      if (startDate && endDate) {
        startDate = moment(startDate).format("MMM DD YYYY");
        endDate = moment(endDate).format("MMM DD YYYY");
      }

      var ids = [];

      const kelas = await KelasModel.find();

      if (startDate && endDate) {
        kelas.map((k) => {
          if (
            moment(k.jadwal[0].tanggal).format("MMM DD YYYY") >= startDate &&
            moment(k.jadwal[k.jadwal.length - 1].tanggal).format(
              "MMM DD YYYY"
            ) <= endDate
          ) {
            ids.push(k._id);
          }
        });
      } else {
        kelas.map((k) => {
          for (var i = 0; i < k.jadwal.length; i++) {
            if (moment(k.jadwal[i].tanggal).format("MMM DD YYYY") == today) {
              ids.push(k._id);

              break;
            }
          }
        });
      }

      const data = await KelasModel.find({
        _id: { $in: ids },
      })
        .populate("kategori trainingMethod")
        .populate({
          path: "materi",
          populate: {
            path: "instruktur",
            model: "User",
            populate: {
              path: "rating",
              model: "rating",
            },
          },
        });

      const totalData = await KelasModel.find({
        _id: { $in: ids },
      }).countDocuments();

      for (const kelas of data) {
        for (let i = 0; i < kelas.peserta.length; i++) {
          const peserta = kelas.peserta[i];
          const userData = await UserModel.findOne({
            _id: peserta.user,
          });
          if (userData) {
            kelas.peserta[i].user = userData;
          }
        }
      }

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "berhasil Get all kelas hari ini", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getWholeReport: async (req, res) => {
    try {
      let { startDate, endDate } = req.query;

      if (startDate && endDate) {
        startDate = moment(startDate).toISOString();
        endDate = moment(endDate).toISOString();
      } else {
        return response(400, {}, "mohon input startDate dan endDate", res);
      }

      var ids = [];
      var peserta = [];
      var dataAbsensi = [];
      var nilai = [];
      var evaluasi = [];

      const kelas = await KelasModel.find();

      kelas.map((k) => {
        if (
          moment(k.jadwal[0].tanggal).toISOString() >= startDate &&
          moment(k.jadwal[k.jadwal.length - 1].tanggal).toISOString() <= endDate
        ) {
          ids.push(k._id);
        }
      });

      const filteredKelas = await KelasModel.find({
        _id: { $in: ids },
      })
        .populate("peserta.user", "userType")
        .populate("kategori", "name")
        .populate("trainingMethod", "name");

      for (let i = 0; i < filteredKelas.length; i++) {
        for (let j = 0; j < filteredKelas[i].peserta.length; j++) {
          const user = await UserModel.findById(
            filteredKelas[i].peserta[j].user
          );

          peserta.push({ kelas: filteredKelas[i].nama, user });

          for (let k = 0; k < filteredKelas[i].jadwal.length; k++) {
            let hadir = false;

            const absen = await Absensi.find({
              user: filteredKelas[i].peserta[j].user,
              $and: [
                {
                  kelas: filteredKelas[i]._id,
                },
              ],
            }).populate("user kelas");

            for (let l = 0; l < absen.length; l++) {
              if (
                moment(absen[l].date).format("YYYY-MM-DD") ==
                moment(filteredKelas[i].jadwal[k].tanggal).format("YYYY-MM-DD")
              ) {
                let time = "";

                for (let m = 0; m < filteredKelas[i].absensi.length; m++) {
                  if (filteredKelas[i].absensi[m].name == absen[l].absenName) {
                    time = filteredKelas[i].absensi[m].time;

                    break;
                  }
                }

                dataAbsensi.push({
                  kelas: filteredKelas[i].nama,
                  jadwal: moment(filteredKelas[i].jadwal[k].tanggal).format(
                    "YYYY-MM-DD"
                  ),
                  abesnTime: time,
                  data: absen[l],
                });

                hadir = true;
              }
            }

            if (!hadir) {
              for (let l = 0; l < filteredKelas[i].absensi.length; l++) {
                dataAbsensi.push({
                  jadwal: moment(filteredKelas[i].jadwal[k].tanggal).format(
                    "YYYY-MM-DD"
                  ),
                  user,
                  kelas: filteredKelas[i].nama,
                  absenName: filteredKelas[i].absensi[l].name,
                  abesnTime: filteredKelas[i].absensi[l].time,
                  status: "tidak hadir",
                  time: "",
                });
              }
            }
          }

          let evaluationResult = await EvaluationFormResult.find({
            kelas: filteredKelas[i]._id,
            $and: [
              {
                user: new mongoose.Types.ObjectId(
                  filteredKelas[i].peserta[j].user
                ),
              },
            ],
          }).populate("user");

          if (evaluationResult.length > 2) {
            let nilaiInstruktur = 0;

            if (evaluationResult.length > 3) {
              let nilaiIntrukturTotal = 0;

              for (let k = 2; k < evaluationResult.length; k++) {
                nilaiIntrukturTotal =
                  nilaiIntrukturTotal + evaluationResult[k].instruktur;
              }

              nilaiInstruktur =
                nilaiIntrukturTotal - (evaluationResult.length - 2);
            } else {
              nilaiInstruktur = evaluationResult[2].instruktur;
            }

            evaluasi.push({
              _id: evaluationResult[0]._id,
              kelas: filteredKelas[i].nama,
              user: user.name,
              nipp: user.nipp,
              sapras: evaluationResult[0].sapras,
              materi: evaluationResult[1].materi,
              instruktur: nilaiInstruktur,
              createdAt: evaluationResult[0].createdAt,
              updatedAt: evaluationResult[0].updatedAt,
            });
          }

          const test = await TestAnswer.find({
            class: filteredKelas[i]._id,
            $and: [
              {
                user: filteredKelas[i].peserta[j].user,
              },
            ],
          }).populate("test");

          if (test.length > 0) {
            for (let k = 0; k < filteredKelas[i].materi.length; k++) {
              const materi = await MateriModel.findById(
                filteredKelas[i].materi[k]
              );

              if (materi.test !== undefined) {
                if (materi.test["pre"] !== undefined) {
                  const preTest = await Test.findById(materi.test["pre"]);

                  let donePre = false;

                  for (let l = 0; l < test.length; l++) {
                    if (test[l].test == materi.test["pre"]) {
                      nilai.push({
                        kelas: filteredKelas[i].nama,
                        user,
                        materi: materi.section,
                        test: preTest,
                        result: test[l],
                      });

                      donePre = true;
                    }
                  }

                  if (!donePre) {
                    nilai.push({
                      kelas: filteredKelas[i].nama,
                      user,
                      materi: materi.section,
                      test: preTest,
                      result: "-",
                    });
                  }
                }

                if (materi.test["post"] !== undefined) {
                  const postTest = await Test.findById(materi.test["post"]);

                  let donePost = false;

                  for (let l = 0; l < test.length; l++) {
                    if (test[l].test == materi.test["post"]) {
                      nilai.push({
                        kelas: filteredKelas[i].nama,
                        user,
                        materi: materi.section,
                        test: postTest,
                        result: test[l],
                      });

                      donePost = true;
                    }
                  }

                  if (!donePost) {
                    nilai.push({
                      kelas: filteredKelas[i].nama,
                      user,
                      materi: materi.section,
                      test: postTest,
                      result: "-",
                    });
                  }
                }
              }

              if (materi.items.length > 0) {
                for (let l = 0; l < materi.items.length; l++) {
                  const quiz = await Test.findById(materi.items[l].quiz);

                  let doneQuiz = false;

                  for (let m = 0; m < test.length; m++) {
                    if (test[m].test == materi.items[l].quiz) {
                      nilai.push({
                        kelas: filteredKelas[i].nama,
                        user,
                        materi: materi.section,
                        test: quiz,
                        result: test[l],
                      });

                      doneQuiz = true;
                    }
                  }

                  if (!doneQuiz) {
                    nilai.push({
                      kelas: filteredKelas[i].nama,
                      user,
                      materi: materi.section,
                      test: quiz,
                      result: "-",
                    });
                  }
                }
              }
            }
          } else {
            for (let k = 0; k < filteredKelas[i].materi.length; k++) {
              const materi = await MateriModel.findById(
                filteredKelas[i].materi[k]
              );

              if (materi.test !== undefined) {
                if (materi.test["pre"] !== undefined) {
                  const preTest = await Test.findById(materi.test["pre"]);

                  nilai.push({
                    kelas: filteredKelas[i].nama,
                    user,
                    materi: materi.section,
                    test: preTest,
                    result: "-",
                  });
                }

                if (materi.test["post"] !== undefined) {
                  const postTest = await Test.findById(materi.test["post"]);

                  nilai.push({
                    kelas: filteredKelas[i].nama,
                    user,
                    materi: materi.section,
                    test: postTest,
                    result: "-",
                  });
                }
              }

              if (materi.items.length > 0) {
                for (let l = 0; l < materi.items.length; l++) {
                  const quiz = await Test.findById(materi.items[l].quiz);

                  let doneQuiz = false;

                  for (let m = 0; m < test.length; m++) {
                    if (test[m].test == materi.items[l].quiz) {
                      nilai.push({
                        kelas: filteredKelas[i].nama,
                        user,
                        materi: materi.section,
                        test: quiz,
                        result: test[l],
                      });

                      doneQuiz = true;
                    }
                  }

                  if (!doneQuiz) {
                    nilai.push({
                      kelas: filteredKelas[i].nama,
                      user,
                      materi: materi.section,
                      test: quiz,
                      result: "-",
                    });
                  }
                }
              }
            }
          }
        }
      }

      const result = [
        {
          kelas: filteredKelas,
          peserta,
          absen: dataAbsensi,
          evaluasi,
          nilai,
        },
      ];

      response(200, result, "berhasil Get laporan", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },

  getIncomingSchedule: async (req, res) => {
    try {
      kelasIds = await getInstructorClass(req.user.id);

      var today = moment().format("YYYY-MM-DD");

      let data = [];

      const kelas = await KelasModel.find({
        _id: { $in: kelasIds },
      });

      if (kelas.length > 0) {
        for (let g = 0; g < kelas.length; g++) {
          for (let h = 0; h < kelas[g].jadwal.length; h++) {
            if (
              moment(kelas[g].jadwal[h].tanggal).format("YYYY-MM-DD") > today
            ) {
              const materiData = await MateriModel.find({
                _id: kelas[g].materi,
              });

              for (let i = 0; i < materiData.length; i++) {
                for (let j = 0; j < materiData[i].instruktur.length; j++) {
                  if (materiData[i].instruktur[j] == req.user.id) {
                    materi = materiData[i].section;

                    break;
                  }
                }

                if (materi.length > 0) {
                  break;
                }
              }

              data.push({
                date: moment(kelas[g].jadwal[h].tanggal).format("YYYY-MM-DD"),
                kelas: kelas[g].nama,
                image: kelas[g].image,
                jamMulai: kelas[g].jadwal[h].jamMulai,
                materi,
              });
            }
          }
        }

        data.sort((a, b) => {
          if (a.date !== b.date) {
            return b.date - a.date;
          }
        });
      }

      response(200, data, "berhasil Get jadwal", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getPersonalClass: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      let data = [];
      let ids = [];
      let finalResult;

      let totalData = 0;

      if (req.user.role == 3) {
        const user = await UserModel.findById(req.user.id);

        user.kelas.map((k) => {
          if (k.status == "approved") {
            ids.push(k.kelas);
          }
        });

        if (ids.length > 0) {
          kelas = await KelasModel.find({
            _id: { $in: ids },
          }).populate("materi peserta kategori trainingMethod");

          if (kelas.length > 0) {
            for (let i = 0; i < kelas.length; i++) {
              let instruktur = null;
              let nilai = "-";

              for (let j = 0; j < kelas[i].materi.length; j++) {
                for (let k = 0; k < kelas[i].materi[j].instruktur.length; k++) {
                  instruktur = await UserModel.findById(
                    kelas[i].materi[j].instruktur[k]
                  );

                  if (instruktur) {
                    break;
                  }
                }
                if (instruktur) {
                  break;
                }
              }

              if (kelas[i].isDone == true) {
                const ranking = await Ranking.findOne({
                  kelas: kelas[i],
                  $and: [
                    {
                      user: req.user._id,
                    },
                  ],
                });

                if (ranking) {
                  nilai = ranking.value;
                }
              }

              data.push({
                id: kelas[i]._id,
                nama: kelas[i].nama,
                methods: kelas[i].methods,
                kategori: kelas[i].kategori.name,
                instruktur: instruktur ? instruktur.name : "",
                slug: kelas[i].slug,
                nilai,
              });
            }
          }
        }

        totalData = data.length;

        data = paginateArray(data, limit, page);

        finalResult = {
          data,
          page,
          limit,
          totalData,
          datalength: data.length,
        };
      } else {
        kelasIds = await getInstructorClass(req.user.id);

        totalData = await KelasModel.find({
          _id: { $in: kelasIds },
        }).countDocuments();

        data = await KelasModel.find({
          _id: { $in: kelasIds },
        })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("materi")
          .populate("kategori")
          .populate({
            path: "desainSertifikat.peserta",
            model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
          })
          .populate({
            path: "desainSertifikat.instruktur",
            model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
          })
          .populate({
            path: "trainingMethod",
          });

        finalResult = {
          data,
          page,
          limit,
          totalData,
          datalength: data.length,
        };
      }

      response(200, finalResult, "berhasil Get kelas", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getStudentPendingClass: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      var ids = [];

      const user = await UserModel.findById(req.user.id);

      user.kelas.map((k) => {
        if (k.status == "pending") {
          ids.push(k.kelas);
        }
      });

      let data = [];

      if (ids.length > 0) {
        kelas = await KelasModel.find({
          _id: { $in: ids },
        }).populate("materi peserta kategori trainingMethod");

        if (kelas.length > 0) {
          for (let i = 0; i < kelas.length; i++) {
            let instruktur = null;

            for (let j = 0; j < kelas[i].materi.length; j++) {
              for (let k = 0; k < kelas[i].materi[j].instruktur.length; k++) {
                instruktur = await UserModel.findById(
                  kelas[i].materi[j].instruktur[k]
                );

                if (instruktur) {
                  break;
                }
              }
              if (instruktur) {
                break;
              }
            }

            data.push({
              id: kelas[i]._id,
              nama: kelas[i].nama,
              start: moment(kelas[i].jadwal[0].tanggal).format("DD-MM-YYYY"),
              instruktur: instruktur ? instruktur.name : "",
            });
          }
        }
      }

      const totalData = data.length;

      data = paginateArray(data, limit, page);

      const finalResult = {
        data,
        page,
        limit,
        totalData,
        datalength: data.length,
      };

      response(200, finalResult, "berhasil Get kelas pending", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  nilaiPerKelas: async (req, res) => {
    const kelasId = req.params.id;
    try {
      const kelas = await KelasModel.findById(kelasId).populate("materi");
      if (!kelas) {
        return response(404, null, "Kelas tidak ditemukan", res);
      }

      const nilaiPermateri = kelas.materi.map(
        (materi) => materi.nilaiPermateri
      );
      const totalNilai = nilaiPermateri.reduce((acc, curr) => acc + curr, 0);
      const rataRata = totalNilai / nilaiPermateri.length;

      kelas.nilaiperkelas = rataRata;
      await kelas.save();

      response(200, kelas, "Nilai rata-rata kelas berhasil di update", res);
    } catch (error) {
      console.log(error.message);
      response(500, error, "Server error", res);
    }
  },

  getOneKelas: async (req, res) => {
    const id = req.params.id;

    try {
      let kelas = await KelasModel.findById(id).populate(
        "materi peserta kategori trainingMethod"
      );

      if (!kelas) {
        response(404, id, "Kelas tidak ditemukan", res);
      }

      response(200, kelas, "kelas ditemukan", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  getOneKelasBySlug: async (req, res) => {
    const slug = req.params.slug;

    try {
      let kelas = await KelasModel.findOne({ slug: slug })
        .populate("materi peserta kategori trainingMethod")
        .populate({
          path: "desainSertifikat.peserta",
          model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
        })
        .populate({
          path: "desainSertifikat.instruktur",
          model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
        })
        .populate({
          path: "materi.instruktur",
          model: "User",
        });

      if (!kelas) {
        response(404, id, "Kelas tidak ditemukan", res);
      }

      let ids = [];

      kelas.materi.map((m) => {
        for (let i = 0; i < m.instruktur.length; i++) {
          ids.push(m.instruktur[i]);
        }
      });

      const instruktur = await UserModel.find({
        _id: { $in: ids },
      }).select("name");

      const data = {
        _id: kelas._id,
        kodeKelas: kelas.kodeKelas,
        nama: kelas.nama,
        kapasitasPeserta: kelas.kapasitasPeserta,
        description: kelas.description,
        methods: kelas.methods,
        materi: kelas.materi,
        absensi: kelas.absensi,
        peserta: kelas.peserta,
        kodeNotaDinas: kelas.kodeNotaDinas,
        kelasType: kelas.kelasType,
        jadwal: kelas.jadwal,
        kategori: kelas.kategori,
        trainingMethod: kelas.trainingMethod,
        kelasStatus: kelas.kelasStatus,
        image: kelas.image,
        linkPelatihan: kelas.linkPelatihan,
        isActive: kelas.isActive,
        status: kelas.status,
        slug: kelas.slug,
        createdAt: kelas.createdAt,
        updatedAt: kelas.updatedAt,
        __v: kelas.__v,
        desainSertifikat: kelas.desainSertifikat,
        instruktur,
      };

      response(200, data, "kelas ditemukan", res);
    } catch (error) {
      console.log(error);
      response(500, error, "Server error", res);
    }
  },

  getOneKelasByND: async (req, res) => {
    const kodeNotaDinas = req.body.kodeNotaDinas;

    try {
      let kelas = await KelasModel.findOne({
        kodeNotaDinas: kodeNotaDinas,
      }).populate("materi peserta kategori trainingMethod status");

      if (!kelas) {
        res.status(404).json(kelas);
        return;
      }

      res.json(kelas);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getKelasByInstruktur: async (req, res) => {
    const { instruktur } = req.params;
    const name =
      req.query.kelas && req.query.kelas.length > 0 ? req.query.kelas : null;
    try {
      let data = [];

      let materiContainer = [];

      const materis = await MateriModel.find({ instruktur: instruktur });

      if (materis.length > 0) {
        materis.map((materi) => {
          materiContainer.push(materi._id);
        });
      }

      if (materiContainer.length > 0) {
        for (let i = 0; i < materiContainer.length; i++) {
          const kelas = await KelasModel.find({
            materi: {
              $in: materiContainer[i],
            },
          })
            .populate("materi kategori trainingMethod")
            .populate({
              path: "materi.items.tugas",
              model: "Tugas",
            });

          if (name && kelas) {
            let kelas1 = [];

            kelas.map((k) => {
              if (k.nama.includes(name)) {
                kelas1.push(k);
              }
            });

            if (kelas1.length > 0) {
              data.push({ kelas: kelas1 });
            }
          } else if (kelas.length > 0) {
            data.push({ kelas });
          }
        }
      }

      return response(200, data, "Kelas berhasil ditemukan", res);
    } catch (error) {
      return response(500, null, error.message, res);
    }
  },

  getPesertaByInstruktur: async (req, res) => {
    const { instruktur } = req.params;

    const { kelasId, materiId } = req.query;

    try {
      let data = [];

      let materiContainer = [];
      let materiDetailContainer = [];
      let kelasContainer = [];

      let materis;

      if (materiId) {
        materis = await MateriModel.findOne({
          instruktur: instruktur,
          $and: [
            {
              _id: materiId,
            },
          ],
        });
      } else {
        materis = await MateriModel.find({ instruktur: instruktur });
      }

      if (materiId) {
        materiContainer = materis._id;
      } else {
        if (materis.length > 0) {
          materis.map((materi) => {
            if (materi.test?.pre) {
              materiContainer.push(materi._id);

              materiDetailContainer.push({
                id: materi._id,
                items: materi.items ?? null,
                test: materi.test ?? null,
              });
            }
          });
        }
      }

      let kelas;

      if (materiId) {
        kelas = await KelasModel.find({
          materi: {
            $in: [materiContainer],
          },
        });

        if (kelasId) {
          kelas.map((k) => {
            if (k._id == kelasId) {
              kelasContainer.push({
                _id: k._id,
                nama: k.nama,
                peserta: k.peserta ?? null,
                materi: k.materi ?? null,
              });
            }
          });
        } else {
          kelas.map((k) => {
            kelasContainer.push({
              _id: k._id,
              nama: k.nama,
              peserta: k.peserta ?? null,
              materi: k.materi ?? null,
            });
          });
        }
      } else {
        if (materiContainer.length > 0) {
          for (let i = 0; i < materiContainer.length; i++) {
            kelas = await KelasModel.find({
              materi: {
                $in: materiContainer[i],
              },
            });

            if (kelasId) {
              kelas.map((k) => {
                if (k._id == kelasId) {
                  kelasContainer.push({
                    _id: k._id,
                    nama: k.nama,
                    peserta: k.peserta ?? null,
                    materi: k.materi ?? null,
                  });
                }
              });
            } else {
              kelas.map((k) => {
                kelasContainer.push({
                  _id: k._id,
                  nama: k.nama,
                  peserta: k.peserta ?? null,
                  materi: k.materi ?? null,
                });
              });
            }
          }
        }
      }

      if (kelasContainer.length > 0) {
        for (let i = 0; i < kelasContainer.length; i++) {
          let peserta = [];
          let materi;

          if (
            kelasContainer[i].peserta.length > 0 &&
            kelasContainer[i].materi.length > 0
          ) {
            console.log("ada peserta dan materi");
            for (let k = 0; k < kelasContainer[i].materi.length; k++) {
              if (materiId) {
                if (kelasContainer[i].materi[k] == materiId) {
                  materi = await MateriModel.findById(
                    kelasContainer[i].materi[k]
                  );
                }
              } else {
                materi = await MateriModel.findById(
                  kelasContainer[i].materi[k]
                );
              }

              for (let j = 0; j < kelasContainer[i].peserta.length; j++) {
                const user = await UserModel.findById(
                  kelasContainer[i].peserta[j].user
                );

                let passPre = false;
                let passPost = false;
                let passQuiz = false;

                if (materi.items.length > 0) {
                  let passingGrade = 0;

                  materi.items.map(async (item) => {
                    if (item.quiz) {
                      const quiz = await Test.findById(item.quiz);

                      if (quiz) {
                        const done = await TestAnswer.findOne({
                          test: item.quiz,
                          $and: [
                            {
                              user: user._id,
                            },
                          ],
                        });

                        if (done) {
                          passingGrade = passingGrade + 1;
                        }
                      }
                    } else {
                      passingGrade = passingGrade + 1;
                    }

                    if (passingGrade == materi.items.length > 0) {
                      passQuiz = true;
                    }
                  });
                } else {
                  passQuiz = true;
                }

                const pre = await Test.findById(materi.test?.pre);
                const post = await Test.findById(materi.test?.post);

                if (pre) {
                  const donePre = await TestAnswer.findOne({
                    test: pre._id,
                    $and: [
                      {
                        user: user._id,
                      },
                    ],
                  });

                  if (donePre) {
                    passPre = true;
                  }
                } else {
                  passPre = true;
                }

                if (post) {
                  const donePost = await TestAnswer.findOne({
                    test: post._id,
                    $and: [
                      {
                        user: user._id,
                      },
                    ],
                  });

                  if (donePost) {
                    passPost = true;
                  }
                } else {
                  passPost = true;
                }

                if (passQuiz && passPost && passPre) {
                  peserta.push(user);
                }
              }
            }

            if (materiId) {
              if (materi._id == materiId) {
                data.push({
                  id_kelas: kelasContainer[i]._id,
                  kelas: kelasContainer[i].nama,
                  id_materi: materi._id,
                  materi: materi.section,
                  peserta,
                });
              }
            } else {
              data.push({
                id_kelas: kelasContainer[i]._id,
                kelas: kelasContainer[i].nama,
                id_materi: materi._id,
                materi: materi.section,
                peserta,
              });
            }
          } else {
            console.log("ada materi");
            if (kelasContainer[i].materi.length > 0) {
              for (let j = 0; j < kelasContainer[i].materi.length; j++) {
                if (materiId) {
                  if (kelasContainer[i].materi[j] == materiId) {
                    materi = await MateriModel.findById(
                      kelasContainer[i].materi[j]
                    );
                  } else {
                    continue;
                  }
                } else {
                  materi = await MateriModel.findById(
                    kelasContainer[i].materi[j]
                  );
                }

                if (materiId) {
                  if (materi._id == materiId) {
                    data.push({
                      id_kelas: kelasContainer[i]._id,
                      kelas: kelasContainer[i].nama,
                      id_materi: materi._id,
                      materi: materi.section,
                      peserta: [],
                    });
                  }
                } else {
                  data.push({
                    id_kelas: kelasContainer[i]._id,
                    kelas: kelasContainer[i].nama,
                    id_materi: materi._id,
                    materi: materi.section,
                    peserta: [],
                  });
                }
              }
            } else {
              data.push({
                id_kelas: kelasContainer[i]._id,
                kelas: kelasContainer[i].nama,
                id_materi: null,
                materi: null,
                peserta: [],
              });
            }
          }
        }
      }

      return response(200, data, "Peserta berhasil ditemukan", res);
    } catch (error) {
      console.log(error);
      return response(500, null, error.message, res);
    }
  },

  createKelasTest: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        kodeKelas,
        nama,
        harga,
        kapasitasPeserta,
        description,
        methods,
        kategori,
        instruktur,
        peserta = [],
        materi,
        jadwal,
        kelasType,
        kodeNotaDinas,
        link,
        absensi,
        trainingMethod,
      } = req.body;

      let imageKelas = null;
      let status = "pending";

      if (req.file) {
        imageKelas = req.file.path.split("/PDAM_TC/")[1];
      }

      if (kodeNotaDinas !== "undefined") {
        const checkKelas = await KelasModel.findOne({ kodeNotaDinas }).session(
          session
        );

        if (checkKelas) {
          response(
            403,
            checkKelas,
            `Kode Nota Dinas sudah terdaftar di kelas lain! (${checkKelas.nama})`,
            res
          );
          await session.abortTransaction();
          return;
        }
      }

      let collectedAbsensi = [];

      if (!absensi) {
        return response(400, null, "Data absensi belum diisi!", res);
      } else {
        collectedAbsensi = absensi.map((absen) => {
          return {
            name: absen.jenis,
            ...absen,
          };
        });
      }

      if (kodeNotaDinas !== "undefined") {
        const getND = await axios.post(
          process.env.url_rab + "nd/global/check",
          {},
          {
            headers: {
              Authorization: `Bearer ${process.env.key_for_grant_access}`,
            },
          }
        );

        if (getND.data) {
          const filtered = getND.data.filter((v) => v.kodeND === kodeNotaDinas);
          if (filtered.length !== 0) {
            status =
              filtered[0].status === "pending"
                ? "pending"
                : filtered[0].status === "Approved"
                ? "draft"
                : "declined";
          }
        }
      }

      const kelas = new KelasModel({
        kodeKelas,
        nama,
        slug: _.kebabCase(nama),
        harga,
        kapasitasPeserta,
        description,
        methods,
        kategori,
        peserta,
        instruktur,
        materi: JSON.parse(materi),
        absensi: collectedAbsensi,
        jadwal,
        kelasType,
        kodeNotaDinas: kodeNotaDinas !== "undefined" ? kodeNotaDinas : null,
        image: imageKelas,
        linkPelatihan: link,
        kategori,
        trainingMethod,
        status,
      });

      const result = await kelas.save({ session });

      await session.commitTransaction();
      response(200, kelas, "Kelas berhasil di buat", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  updateKelasAdminSide: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const id = req.params.id;

    try {
      const {
        kodeKelas,
        nama,
        harga,
        kapasitasPeserta,
        description,
        methods,
        kategori,
        peserta = [],
        materi,
        jadwal,
        jadwalBaru,
        kelasType,
        kodeNotaDinas,
        link,
        absensi,
        status,
        trainingMethod,
      } = req.body;

      const checkKelas = await KelasModel.findById(id);

      let newStatus = status;

      let newAbsensi = absensi ? absensi : [];

      let imageKelas;

      if (req.file) {
        imageKelas = "/upload/" + req.file.path.split("/upload/")[1];
      }

      let collectedAbsensi = [];

      if (newAbsensi.length !== 0) {
        collectedAbsensi = newAbsensi.map((absen) => {
          return {
            name: absen.jenis,
            ...absen,
          };
        });
      }

      let parsedJadwal;
      if (jadwalBaru) {
        parsedJadwal = JSON.parse(jadwalBaru);
      }

      const kelas = {
        kodeKelas: kodeKelas ?? checkKelas.kodeKelas,
        nama: nama ?? checkKelas.nama,
        slug: nama ? _.kebabCase(nama) : checkKelas.slug,
        harga: harga ?? checkKelas.harga,
        kapasitasPeserta: kapasitasPeserta ?? checkKelas.kapasitasPeserta,
        description: description ?? checkKelas.description,
        methods: methods ?? checkKelas.methods,
        kategori: kategori ?? checkKelas.kategori,
        peserta: peserta.length <= 0 ? checkKelas.peserta : peserta,
        materi: materi ? JSON.parse(materi) : checkKelas.materi,
        absensi:
          collectedAbsensi.length !== 0 ? collectedAbsensi : checkKelas.absensi,
        jadwal: parsedJadwal ?? checkKelas.jadwal,
        kelasType: kelasType ?? checkKelas.kelasType,
        kodeNotaDinas: kodeNotaDinas ?? checkKelas.kodeNotaDinas,
        image: imageKelas ? imageKelas : checkKelas.image,
        linkPelatihan: link ?? checkKelas.linkPelatihan,
        kategori: kategori ?? checkKelas.kategori,
        status: newStatus ?? checkKelas.status,
        trainingMethod: trainingMethod ?? checkKelas.trainingMethod,
      };

      const result = await KelasModel.findByIdAndUpdate(id, kelas, {
        new: true,
      });

      if (newStatus && newStatus == "ended") {
        const user = await UserModel.find({
          role: 3,
        });

        Promise.all(
          user.map(async (u) => {
            if (u.kelas.length > 0) {
              let kelas = [];

              u.kelas.map((m) => {
                if (m.kelas.toHexString() == id) {
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

              await UserModel.findByIdAndUpdate(
                u._id,
                {
                  kelas,
                },
                {
                  new: true,
                }
              );
            }
          })
        );
      }

      response(200, result, "Kelas berhasil di update", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updateKelasAdminSlug: async (req, res) => {
    try {
      const slug = req.params.slug;
      const updated = req.body;
      const result = await KelasModel.findOneAndUpdate(
        { slug: slug },
        updated,
        {
          new: true,
        }
      );

      response(200, result, "Kelas berhasil di update", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updateKelasWithND: async (req, res) => {
    try {
      const { nd, ...rest } = req.body;
      const result = await KelasModel.findOneAndUpdate(
        { kodeNotaDinas: nd },
        { $set: { ...rest } },
        {
          new: true,
        }
      );

      console.log(result);

      response(200, result, "Kelas berhasil di update", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updateKelasInstrukturSide: async (req, res) => {
    try {
      const id = req.params.id;
      const deskripsi = req.body.deskripsi;
      const materi = req.body.materi;

      const result = await KelasModel.findByIdAndUpdate(
        id,
        { materi: materi, description: deskripsi },
        { new: true }
      ); // $push: { materi: { $each: materi }

      response(200, result, "Kelas berhasil di update", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  deleteKelas: async (req, res) => {
    const id = req.params.id;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const checkKelas = await KelasModel.findOne({ _id: id }).session(session);
      if (checkKelas.peserta.length !== 0) {
        response(
          500,
          checkKelas,
          "Kelas ini sudah memiliki peserta , tidak bisa dihapus!",
          res
        );
        await session.abortTransaction();
        return;
      }
      const result = await KelasModel.findByIdAndDelete(id, { session });

      await session.commitTransaction();
      response(200, result, "Kelas berhasil di hapus", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  deactivatedKelas: async (req, res) => {
    // menonaktifkan kelas
    try {
      const id = req.params.id;
      const result = await KelasModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      response(200, result, "Kelas berhasil di nonaktifkan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  activateKelas: async (req, res) => {
    // menonaktifkan kelas
    try {
      const id = req.params.id;
      const result = await KelasModel.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "draft",
            isActive: true,
          },
        },
        { new: true }
      );

      response(200, result, "Kelas berhasil di aktifkan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  enrolKelas: async (req, res) => {
    const slug = req.params.slug;
    const idUser = req.body.idUser;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const resultkelas = await KelasModel.findOne({ slug: slug }).session(
        session
      );
      const resultUser = await UserModel.findOne({ _id: idUser }).session(
        session
      );

      if (resultkelas.peserta.length == resultkelas.kapasitasPeserta) {
        response(401, resultkelas, "Kelas sudah penuh", res);

        await session.abortTransaction();

        session.endSession();
      } else {
        if (!resultkelas.peserta.includes(resultUser._id)) {
          if (
            (resultkelas.kelasType === 1 && resultUser.userType === 1) ||
            (resultkelas.kelasType === 0 &&
              (resultUser.userType === 1 || resultUser.userType === 0))
          ) {
            const extractedPesertaKelas = [...resultkelas.peserta];
            const extractedKelasUser = [...resultUser.kelas];

            extractedPesertaKelas.push({
              user: resultUser._id,
            });

            extractedKelasUser.push({
              kelas: resultkelas._id,
            });

            const resultEditKelas = await KelasModel.findOneAndUpdate(
              { slug: slug },
              { $set: { peserta: extractedPesertaKelas } },
              { new: true, session }
            );
            const resultEditUser = await UserModel.findOneAndUpdate(
              { _id: idUser },
              { $set: { kelas: extractedKelasUser } },
              { new: true, session }
            );

            await session.commitTransaction();
            session.endSession();

            await sendClassEnrollmentMail(
              resultUser.email,
              resultkelas.nama,
              resultUser.username
            );

            response(200, resultkelas, "Berhasil enroll", res);
          } else {
            response(
              401,
              resultkelas,
              "Anda tidak bisa enroll untuk kelas ini (Status : Khusus Peserta Internal)",
              res
            );
            await session.abortTransaction();
            session.endSession();
          }
        } else {
          response(400, {}, "User sudah terdaftar di kelas", res);
          await session.abortTransaction();
          session.endSession();
        }
      }
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },

  assignPesertaKelas: async (req, res) => {
    const slug = req.params.slug;
    const idUser = req.body.idUser;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const resultkelas = await KelasModel.findOne({ slug: slug }).session(
        session
      );
      const resultUser = await UserModel.findOne({ _id: idUser }).session(
        session
      );

      if (!resultkelas.peserta.includes(resultUser._id)) {
        if (
          (resultkelas.kelasType === 1 && resultUser.userType === 1) ||
          (resultkelas.kelasType === 0 &&
            (resultUser.userType === 1 || resultUser.userType === 0))
        ) {
          const extractedPesertaKelas = [...resultkelas.peserta];
          const extractedKelasUser = [...resultUser.kelas];

          extractedPesertaKelas.push({
            user: resultUser._id,
            status: "approved",
          });

          extractedKelasUser.push({
            kelas: resultkelas._id,
            status: "approved",
          });

          const resultEditKelas = await KelasModel.findOneAndUpdate(
            { slug: slug },
            { $set: { peserta: extractedPesertaKelas } },
            { new: true, session }
          );
          const resultEditUser = await UserModel.findOneAndUpdate(
            { _id: idUser },
            { $set: { kelas: extractedKelasUser } },
            { new: true, session }
          );

          await session.commitTransaction();
          session.endSession();

          response(200, resultkelas, "Berhasil ditambahkan", res);
        } else {
          response(
            401,
            resultkelas,
            "Peserta ini tidak bisa ditambahkan (Status Peserta: Eksternal)",
            res
          );
          await session.abortTransaction();
          session.endSession();
        }
      } else {
        response(400, {}, "Peserta sudah terdaftar di kelas", res);
        await session.abortTransaction();
        session.endSession();
      }
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },

  enrollmentKelas: async (req, res) => {
    try {
      const id = req.params.id;
      const idUser = req.body.idUser;
      const resultkelas = await KelasModel.findById(id);
      const resultUser = await UserModel.findById(idUser);
      //ngecek kalo kelas sudah penuh
      if (resultkelas.peserta.length < resultkelas.kapasitasPeserta) {
        //ngecek kalo user sudah terdaftar di kelas
        if (!resultkelas.peserta.includes(idUser)) {
          //ngecek kalo user internal atau eksternal
          if (resultkelas.kelasType === 1 && resultUser.userType === 1) {
            const calonPeserta = new calonPesertaSchema({
              kelas: id,
              idUser: idUser,
            });
            //masukin si user ke field calonPeserta di kelas
            resultkelas.calonPeserta.push(calonPeserta);
            const result = await resultkelas.save();
            response(
              200,
              result,
              "Berhasil enrol harap tunggu di setujui",
              res
            );
          } else if (resultkelas.kelasType === 0 && resultUser.userType === 0) {
            const calonPeserta = new calonPesertaSchema({
              kelas: id,
              idUser: idUser,
            });
            //masukin si user ke field calonPeserta di kelas
            resultkelas.calonPeserta.push(calonPeserta);
            const result = await resultkelas.save();
            response(
              200,
              result,
              "Berhasil enrol harap tunggu di setujui",
              res
            );
          } else if (resultkelas.kelasType === 0 || resultUser.userType === 1) {
            const calonPeserta = new calonPesertaSchema({
              kelas: id,
              idUser: idUser,
            });
            //masukin si user ke field calonPeserta di kelas
            resultkelas.calonPeserta.push(calonPeserta);
            const result = await resultkelas.save();
            response(
              200,
              result,
              "Berhasil enrol harap tunggu di setujui",
              res
            );
          } else {
            response(401, resultkelas, "tidak bisa enrol", res);
          }
        } else {
          response(400, idUser, "User sudah terdaftar di kelas", res);
        }
      } else {
        response(400, resultkelas, "Kelas sudah penuh", res);
      }
    } catch (error) {
      console.log(error.message);
      response(500, error, "Server error", res);
    }
  },

  approvePeserta: async (req, res) => {
    const { slug } = req.params;
    const { status, id } = req.body;

    const session = await mongoose.startSession();

    session.startTransaction();

    try {
      const get = await KelasModel.findOne({ slug })
        .select("peserta")
        .session(session);

      const kelas = await KelasModel.findOne({ slug });

      const extracted = [...get.peserta];

      for (let i = 0; i < id.length; i++) {
        const selectPeserta = extracted.filter(
          (v) => v.user.toString() === id[i]
        );
        const withoutSelected = extracted.filter(
          (v) => v.user.toString() !== id[i]
        );

        if (selectPeserta.length > 0) {
          selectPeserta[0].status = status;
        }

        const mergePesertaList = [...withoutSelected, ...selectPeserta];

        await KelasModel.findOneAndUpdate(
          { slug },
          { $set: { peserta: mergePesertaList } },
          { new: true, session }
        );

        const getUser = await UserModel.findOne({
          _id: id[i],
        })
          .select("kelas")
          .session(session);

        const extractUser = [...getUser.kelas];

        const selectKelas = extractUser.filter(
          (v) => v.kelas.toString() === get._id.toString()
        );
        const withoutSelectedKelas = extractUser.filter(
          (v) => v.kelas.toString() !== get._id.toString()
        );

        selectKelas[0].status = status;

        const mergeKelasList = [...withoutSelectedKelas, ...selectKelas];

        await UserModel.findOneAndUpdate(
          { _id: id[i] },
          { $set: { kelas: mergeKelasList } },
          { new: true, session }
        );

        await classEnrollmentLog.create({
          user: id[i],
          kelas: kelas._id,
        });

        const user = await UserModel.findOne({
          _id: id[i],
        });

        await sendClassEnrollmentMail(user.email, kelas.nama, user.username);
      }

      await session.commitTransaction();

      response(200, {}, "Berhasil merubah status", res);
    } catch (error) {
      console.log(error);
      response(500, error, "Server error", res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  getMateriKelas: async (req, res) => {
    const { slug } = req.params;

    try {
      const kelas = await KelasModel.findOne({ slug })
        .populate({
          path: "materi",
          populate: {
            path: "instruktur",
            model: "User",
            populate: {
              path: "rating",
              model: "rating",
            },
          },
        })
        .populate({
          path: "materi", // Populate the 'materi' array
          populate: {
            path: "items.tugas", // Populate the 'tugas' field within the 'materi' array
            model: "Tugas", // The Tugas model
          },
        })
        .populate({
          path: "materi",
          populate: {
            path: "test.pre test.post",
            model: "Test",
          },
        })
        .populate({
          path: "trainingMethod",
        })
        .select("materi nama linkPelatihan")
        .exec();

      if (!kelas) {
        response(404, id, "Materi tidak ditemukan", res);
      }

      let isEvaluated = false;
      let isDone = false;

      const user = await UserModel.findById(req.user.id);

      for (let i = 0; i < user.kelas.length; i++) {
        if (user.kelas[i].kelas.toString() == kelas._id.toString()) {
          if (user.kelas[i].isDone == true) {
            isDone = true;

            break;
          }
        }
      }

      const checkEvaluationForm = await EvaluationFormResult.findOne({
        kelas: kelas._id,
        $and: [
          {
            user: req.user.id,
          },
        ],
      });

      if (checkEvaluationForm) {
        isEvaluated = true;
      }

      const data = {
        _id: kelas._id,
        nama: kelas.nama,
        materi: kelas.materi,
        linkPelatihan: kelas.linkPelatihan,
        isDone,
        isEvaluated,
      };

      response(200, data, "Materi ditemukan", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getWithFilter: async (req, res) => {
    try {
      let totalData;

      if (req.body.isActive == null || req.body.isActive == undefined) {
        req.body.isActive = true;
      }

      const { nama, userType, methods } = req.query;

      const fromDate = req.query.fromDate ? req.query.fromDate : null;

      const toDate = req.query.toDate ? req.query.toDate : null;

      let data = await KelasModel.find({ ...req.body })
        .populate("peserta.user")
        .populate("materi")
        .populate("kategori")
        .populate({
          path: "desainSertifikat.peserta",
          model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
        })
        .populate({
          path: "desainSertifikat.instruktur",
          model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
        })
        .populate({
          path: "trainingMethod",
        })
        .sort({ createdAt: -1 });

      let ids = [];

      if (nama || userType || fromDate || toDate) {
        let kelas = await KelasModel.find();

        let len = 0;

        if (nama) {
          len = nama.length;
          kelas.map(async (k) => {
            if (k.nama.substring(0, len).toLowerCase() == nama.toLowerCase()) {
              ids.push(k._id);
            }
          });

          kelas = await KelasModel.find({
            _id: { $in: ids },
          });
        }

        if (userType < 2) {
          let pesertaCount = 0;

          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.peserta.length; i++) {
                const user = await UserModel.findById(k.peserta[i].user);

                if (user && user.userType == userType) {
                  pesertaCount = pesertaCount + 1;
                }

                if (pesertaCount == k.peserta.length) {
                  ids.push(k._id);
                }
              }
            })
          );
        } else if (userType > 1) {
          kelas.map((k) => {
            ids.push(k._id);
          });
        }

        if (userType) {
          kelas = await KelasModel.find({
            _id: { $in: ids },
          });
        }

        if (fromDate && toDate) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.jadwal.length; i++) {
                if (
                  moment(k.jadwal[i].tanggal).format("YYYY-MM-DD") >=
                    fromDate &&
                  moment(k.jadwal[i].tanggal).format("YYYY-MM-DD") <= toDate
                ) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        } else if (fromDate) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.jadwal.length; i++) {
                if (
                  moment(k.jadwal[i].tanggal).format("YYYY-MM-DD") >= fromDate
                ) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        } else if (toDate) {
          await Promise.all(
            kelas.map(async (k) => {
              for (var i = 0; i < k.jadwal.length; i++) {
                if (
                  moment(k.jadwal[i].tanggal).format("YYYY-MM-DD") <= toDate
                ) {
                  ids.push(k._id);

                  break;
                }
              }
            })
          );
        }

        data = await KelasModel.find({
          _id: { $in: ids },
        })
          .populate("materi")
          .populate("peserta.user")
          .populate("kategori")
          .populate({
            path: "desainSertifikat.peserta",
            model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
          })
          .populate({
            path: "desainSertifikat.instruktur",
            model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
          })
          .populate({
            path: "trainingMethod",
          })
          .sort({ createdAt: -1 });
      }

      if (!req.query.page || req.query.page === 0) {
        if (req.body.bulan != null) {
          data = data.filter((val, idx) => {
            const isoDate = new Date(val.jadwal[0].tanggal);
            const isoDateMonth = isoDate.getUTCMonth() + 1;
            const numericMonth = parseInt(req.body.bulan);

            return numericMonth === isoDateMonth;
          });
        }

        if (methods) {
          ids = [];

          data.map((k) => {
            if (methods == k.methods) {
              ids.push(k._id);
            }
          });

          data = await KelasModel.find({
            _id: { $in: ids },
          })
            .populate("materi")
            .populate("peserta.user")
            .populate("kategori")
            .populate({
              path: "desainSertifikat.peserta",
              model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
            })
            .populate({
              path: "desainSertifikat.instruktur",
              model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
            })
            .populate({
              path: "trainingMethod",
            })
            .sort({ createdAt: -1 });
        }

        if (data) {
          totalData = data.length;
        }

        result = {
          data,
          "total data": totalData,
        };

        return response(200, result, "get kelas", res);
      } else {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        let rawData = await KelasModel.find({ ...req.body });

        if (nama || userType || fromDate || toDate) {
          rawData = await KelasModel.find({
            _id: { $in: ids },
          });

          data = await KelasModel.find({
            _id: { $in: ids },
          })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("materi")
            .populate("peserta.user")
            .populate("kategori")
            .populate({
              path: "desainSertifikat.peserta",
              model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
            })
            .populate({
              path: "desainSertifikat.instruktur",
              model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
            })
            .populate({
              path: "trainingMethod",
            })
            .sort({ createdAt: -1 });
        } else {
          data = await KelasModel.find({ ...req.body })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("materi")
            .populate("peserta.user")
            .populate("kategori")
            .populate({
              path: "desainSertifikat.peserta",
              model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
            })
            .populate({
              path: "desainSertifikat.instruktur",
              model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
            })
            .populate({
              path: "trainingMethod",
            })
            .sort({ createdAt: -1 });
        }

        if (methods) {
          if (nama || userType || fromDate || toDate) {
            data = await KelasModel.find({
              _id: { $in: ids },
            })
              .populate("materi")
              .populate("peserta.user")
              .populate("kategori")
              .populate({
                path: "desainSertifikat.peserta",
                model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
              })
              .populate({
                path: "desainSertifikat.instruktur",
                model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
              })
              .populate({
                path: "trainingMethod",
              })
              .sort({ createdAt: -1 });
          } else {
            data = await KelasModel.find()
              .populate("peserta.user")
              .populate("materi")
              .populate("kategori")
              .populate({
                path: "desainSertifikat.peserta",
                model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
              })
              .populate({
                path: "desainSertifikat.instruktur",
                model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
              })
              .populate({
                path: "trainingMethod",
              })
              .sort({ createdAt: -1 });
          }

          ids = [];

          data.map((k) => {
            if (methods == k.methods) {
              ids.push(k._id);
            }
          });

          rawData = await KelasModel.find({
            _id: { $in: ids },
          });

          data = await KelasModel.find({
            _id: { $in: ids },
          })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("peserta.user")
            .populate("materi")
            .populate("kategori")
            .populate({
              path: "desainSertifikat.peserta",
              model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'peserta' reference
            })
            .populate({
              path: "desainSertifikat.instruktur",
              model: "Sertifikat", // Replace 'Sertifikat' with the actual model name for the 'instruktur' reference
            })
            .populate({
              path: "trainingMethod",
            })
            .sort({ createdAt: -1 });
        }

        totalData = rawData.length;

        result = {
          data: data,
          "total data": totalData,
        };

        return response(200, result, "Berhasil get filtered kelas", res);
      }
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },

  getPesertaKelas: async (req, res) => {
    const { slug } = req.params;

    let totalData;

    const isPaginate = parseInt(req.query.paginate);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = parseInt(req.query.type);
    const status = req.query.status;

    try {
      const getKelas = await KelasModel.findOne({ slug });

      //? Get All Peserta Id, Expected Output UserID[]
      let pesertaIds = getKelas.peserta.map((v) => v.user);

      //? Prepare an Empty Variable for Accepting Modified Peserta Data
      let peserta;

      if (isPaginate === 0) {
        //? Get Data Peserta with Selected ID in pesertaIds, Expected Output User[]
        peserta = await UserModel.find({ _id: { $in: pesertaIds } });

        let registered = peserta.map((p) => p);
        console.log(registered);

        //? If Query has Type then Modify the Peserta
        if (type && type > -1) {
          pesertaIds = [];

          for (let i = 0; i < registered.length; i++) {
            if (registered[i].userType == type) {
              pesertaIds.push(registered[i]._id);
            }
          }

          peserta = await UserModel.find({
            _id: { $in: pesertaIds },
          });

          return response(200, peserta, "Peserta ditemukan", res);
        }

        registered = peserta.map((p) => p);

        if (status) {
          pesertaIds = [];

          for (let i = 0; i < registered.length; i++) {
            for (let j = 0; j < registered[i].kelas.length; j++) {
              if (
                registered[i].kelas[j].kelas.toString() ==
                  getKelas._id.toString() &&
                registered[i].kelas[j].status == status
              ) {
                pesertaIds.push(registered[i]._id);
              }
            }
          }

          peserta = await UserModel.find({
            _id: { $in: pesertaIds },
          });
        }

        if (peserta.length !== 0) {
          totalData = peserta.length;
        }

        let result = {
          data: peserta,
          total: totalData,
        };
        response(200, result, "get Peserta", res);
        return;
      }

      //? Get Data Peserta with Selected ID in pesertaIds, Expected Output User[]
      peserta = await UserModel.find({ _id: { $in: pesertaIds } })
        .skip((page - 1) * limit)
        .limit(limit);

      let registered = peserta.map((p) => p);

      //? If Query has Type then Modify the Peserta
      if (type > -1) {
        pesertaIds = [];

        for (let i = 0; i < registered.length; i++) {
          if (registered[i].userType == type) {
            pesertaIds.push(registered[i]._id);
          }
        }

        peserta = await UserModel.find({
          _id: { $in: pesertaIds },
        })
          .skip((page - 1) * limit)
          .limit(limit);
      }

      registered = peserta.map((p) => p);

      if (status.length > 0) {
        pesertaIds = [];

        for (let i = 0; i < registered.length; i++) {
          for (let j = 0; j < registered[i].kelas.length; j++) {
            if (
              registered[i].kelas[j].kelas.toString() ==
                getKelas._id.toString() &&
              registered[i].kelas[j].status == status
            ) {
              pesertaIds.push(registered[i]._id);
            }
          }
        }

        peserta = await UserModel.find({
          _id: { $in: pesertaIds },
        })
          .skip((page - 1) * limit)
          .limit(limit);
      }

      if (peserta) {
        totalData = peserta.length;
      }

      const result = {
        name: getKelas.nama,
        peserta,
        total: totalData,
        page: page,
        limit: limit,
      };

      response(200, result, "Data Peserta ditemukan", res);
    } catch (error) {
      response(500, error.message, error.message, res);
    }
  },

  kickPeserta: async (req, res) => {
    const { slug, id } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const getKelas = await KelasModel.findOne({ slug }).session(session);
      const getUser = await UserModel.findOne({ _id: id }).session(session);

      const kelasWithoutUser = getKelas.peserta.filter(
        (v) => v.user.toString() !== getUser._id.toString()
      );
      const updateKelas = await KelasModel.findOneAndUpdate(
        { slug },
        { $set: { peserta: kelasWithoutUser } },
        { new: true, session }
      );

      const userWithoutKelas = getUser.kelas.filter(
        (v) => v.kelas.toString() !== getKelas._id.toString()
      );
      const updateUser = await UserModel.findOneAndUpdate(
        { _id: id },
        { $set: { kelas: userWithoutKelas } },
        { new: true, session }
      );

      await session.commitTransaction();
      response(200, updateKelas, "Berhasil mengeluarkan user dari kelas", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  listKelasAbsenUser: async (req, res) => {
    const { iduser } = req.params;

    try {
      const get = await KelasModel.find({ "peserta.user": iduser })
        .populate("materi kategori")
        .populate({
          path: "materi.items.tugas",
          model: "Tugas",
        })
        .lean()
        .exec();
      response(200, get, "Kelas berhasil ditemukan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  getRecentClass: async (req, res) => {
    try {
      const data = await RecentClass.find({
        user: req.user.id,
      })
        .populate("kelas")
        .sort({ number: 1 });

      response(200, data, "Kelas terbaru berhasil ditemukan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  checkClassResolvement: async (req, res) => {
    try {
      const { kelas } = req.params;

      const user = await UserModel.findById(req.user.id);

      let status = false;

      user.kelas.map((m) => {
        if (m.kelas.toHexString() == kelas.toHexString()) {
          status = true;
        }
      });

      if (status) {
        return response(200, status, "Kelas sudah diselesaikan", res);
      }

      return response(200, status, "Kelas belum diselesaikan", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  storeRecentClassIO: async ({ id, id_user }) => {
    try {
      const check = await RecentClass.findOne({
        user: id_user,
        $and: [
          {
            kelas: id,
          },
        ],
      });

      if (check) {
        const data = await RecentClass.find({
          user: id_user,
        })
          .populate("kelas")
          .sort({ number: 1 });

        return data;
      }

      const first = await RecentClass.findOne({
        number: 1,
        $and: [
          {
            user: id_user,
          },
        ],
      });

      const second = await RecentClass.findOne({
        number: 2,
        $and: [
          {
            user: id_user,
          },
        ],
      });

      const third = await RecentClass.findOne({
        number: 3,
        $and: [
          {
            user: id_user,
          },
        ],
      });

      const fourth = await RecentClass.findOne({
        number: 4,
        $and: [
          {
            user: id_user,
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
        user: id_user,
      });

      const data = await RecentClass.find({
        user: id_user,
      })
        .populate("kelas")
        .sort({ number: 1 });

      return data;
    } catch (error) {
      console.log(error);
    }
  },

  checkNotaDinasKelas: async (req, res) => {
    const { kodeNotaDinas } = req.body;
    try {
      const checkKelas = await KelasModel.findOne({ kodeNotaDinas });

      if (checkKelas) {
        return response(
          403,
          checkKelas,
          `Kode Nota Dinas sudah terdaftar di kelas lain! (${checkKelas.nama})`,
          res
        );
      } else {
        return response(
          200,
          checkKelas,
          `Kode Nota Dinas ini bisa digunakkan!`,
          res
        );
      }
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
};
