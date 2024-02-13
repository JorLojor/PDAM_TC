const Kelas = require("../models/kelas");
const User = require("../models/user");
const Absensi = require("../models/absensiPeserta");
const response = require("../respons/response");
const mongoose = require("mongoose");
const moment = require("moment");
const { convertDate, paginateArray } = require("../service/index");

module.exports = {
  index: async (req, res) => {
    try {
      const fromDate = req.query.fromDate ? moment(req.query.fromDate) : null;
      const isPaginate = req.query.paginate
        ? parseInt(req.query.paginate)
        : null;
      const kelas = req.query.kelas;
      const toDate = req.query.toDate ? moment(req.query.toDate) : null;
      const user = req.query.user;

      console.log(kelas, user);

      if (kelas && user && fromDate) {
        totalData = await Absensi.find({
          user,
          $and: [
            {
              kelas,
            },
            {
              createdAt: {
                $gte: fromDate.startOf("day").toDate(),
                $lte: fromDate.endOf("day").toDate(),
              },
            },
          ],
        }).countDocuments();

        if (toDate) {
          totalData = await Absensi.find({
            user,
            $and: [
              {
                kelas,
              },
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: toDate.endOf("day").toDate(),
                },
              },
            ],
          }).countDocuments();
        }
      } else if (kelas && fromDate) {
        totalData = await Absensi.find({
          kelas,
          $and: [
            {
              createdAt: {
                $gte: fromDate.startOf("day").toDate(),
                $lte: fromDate.endOf("day").toDate(),
              },
              user,
            },
          ],
        }).countDocuments();

        if (toDate) {
          totalData = await Absensi.find({
            kelas,
            $and: [
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: toDate.endOf("day").toDate(),
                },
                user,
              },
            ],
          }).countDocuments();
        }
      } else if (user && fromDate) {
        totalData = await Absensi.find({
          user,
          $and: [
            {
              createdAt: {
                $gte: fromDate.startOf("day").toDate(),
                $lte: fromDate.endOf("day").toDate(),
              },
              user,
            },
          ],
        }).countDocuments();

        if (toDate) {
          totalData = await Absensi.find({
            user,
            $and: [
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: toDate.endOf("day").toDate(),
                },
                user,
              },
            ],
          }).countDocuments();
        }
      } else if (kelas && user) {
        totalData = await Absensi.find({
          kelas,
          $and: [
            {
              user,
            },
          ],
        }).countDocuments();
      } else if (kelas) {
        totalData = await Absensi.find({
          kelas,
        }).countDocuments();
      } else if (user) {
        totalData = await Absensi.find({
          user,
        }).countDocuments();
      } else if (fromDate) {
        totalData = await Absensi.find({
          createdAt: {
            $gte: fromDate.startOf("day").toDate(),
            $lte: fromDate.endOf("day").toDate(),
          },
        }).countDocuments();

        if (toDate) {
          totalData = await Absensi.find({
            createdAt: {
              $gte: fromDate.startOf("day").toDate(),
              $lte: toDate.endOf("day").toDate(),
            },
          }).countDocuments();
        }
      } else {
        totalData = await Absensi.find().countDocuments();
      }

      if (isNaN(isPaginate)) {
        if (kelas && user && fromDate) {
          data = await Absensi.find({
            user,
            $and: [
              {
                kelas,
              },
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: fromDate.endOf("day").toDate(),
                },
              },
            ],
          })
            .populate("user", "name")
            .populate("kelas");

          if (toDate) {
            data = await Absensi.find({
              user,
              $and: [
                {
                  kelas,
                },
                {
                  createdAt: {
                    $gte: fromDate.startOf("day").toDate(),
                    $lte: toDate.endOf("day").toDate(),
                  },
                },
              ],
            })
              .populate("user", "name")
              .populate("kelas");
          }
        } else if (kelas && user) {
          data = await Absensi.find({
            user,
            $and: [
              {
                kelas,
              },
            ],
          })
            .populate("user", "name")
            .populate("kelas");
        } else if (kelas && fromDate) {
          data = await Absensi.find({
            kelas,
            $and: [
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: fromDate.endOf("day").toDate(),
                },
              },
            ],
          })
            .populate("user", "name")
            .populate("kelas");

          if (toDate) {
            data = await Absensi.find({
              kelas,
              $and: [
                {
                  createdAt: {
                    $gte: fromDate.startOf("day").toDate(),
                    $lte: toDate.endOf("day").toDate(),
                  },
                },
              ],
            })
              .populate("user", "name")
              .populate("kelas");
          }
        } else if (user && fromDate) {
          data = await Absensi.find({
            user,
            $and: [
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: fromDate.endOf("day").toDate(),
                },
              },
            ],
          })
            .populate("user", "name")
            .populate("kelas");

          if (toDate) {
            data = await Absensi.find({
              user,
              $and: [
                {
                  createdAt: {
                    $gte: fromDate.startOf("day").toDate(),
                    $lte: toDate.endOf("day").toDate(),
                  },
                },
              ],
            })
              .populate("user", "name")
              .populate("kelas");
          }
        } else if (kelas) {
          data = await Absensi.find({
            kelas,
          })
            .populate("user", "name")
            .populate("kelas");
        } else if (user) {
          data = await Absensi.find({
            user,
          })
            .populate("user", "name")
            .populate("kelas");
        } else if (fromDate) {
          data = await Absensi.find({
            createdAt: {
              $gte: fromDate.startOf("day").toDate(),
              $lte: fromDate.endOf("day").toDate(),
            },
          })
            .populate("user", "name")
            .populate("kelas");

          if (toDate) {
            data = await Absensi.find({
              createdAt: {
                $gte: fromDate.startOf("day").toDate(),
                $lte: toDate.endOf("day").toDate(),
              },
            })
              .populate("user", "name")
              .populate("kelas");
          }
        } else {
          data = await Absensi.find()
            .populate("user", "name")
            .populate("kelas");
        }

        result = {
          data,
          "total data": totalData,
        };

        return response(200, result, "Berhasil get all absensi", res);
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (kelas && user && fromDate) {
        data = await Absensi.find({
          user,
          $and: [
            {
              kelas,
            },
            {
              createdAt: {
                $gte: fromDate.startOf("day").toDate(),
                $lte: fromDate.endOf("day").toDate(),
              },
            },
          ],
        })
          .populate("user", "name")
          .populate("kelas")
          .skip((page - 1) * limit)
          .limit(limit);

        if (toDate) {
          data = await Absensi.find({
            user,
            $and: [
              {
                kelas,
              },
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: toDate.endOf("day").toDate(),
                },
              },
            ],
          })
            .populate("user", "name")
            .populate("kelas")
            .skip((page - 1) * limit)
            .limit(limit);
        } else if (kelas && user) {
          data = await Absensi.find({
            user,
            $and: [
              {
                kelas,
              },
            ],
          })
            .populate("user", "name")
            .populate("kelas")
            .skip((page - 1) * limit)
            .limit(limit);
        }
      } else if (kelas && fromDate) {
        data = await Absensi.find({
          kelas,
          $and: [
            {
              createdAt: {
                $gte: fromDate.startOf("day").toDate(),
                $lte: fromDate.endOf("day").toDate(),
              },
            },
          ],
        })
          .populate("user", "name")
          .populate("kelas")
          .skip((page - 1) * limit)
          .limit(limit);

        if (toDate) {
          data = await Absensi.find({
            kelas,
            $and: [
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: toDate.endOf("day").toDate(),
                },
              },
            ],
          })
            .populate("user", "name")
            .populate("kelas")
            .skip((page - 1) * limit)
            .limit(limit);
        }
      } else if (kelas && user) {
        data = await Absensi.find({
          kelas,
          $and: [{ user }],
        })
          .populate("user", "name")
          .populate("kelas")
          .skip((page - 1) * limit)
          .limit(limit);
      } else if (user && fromDate) {
        data = await Absensi.find({
          user,
          $and: [
            {
              createdAt: {
                $gte: fromDate.startOf("day").toDate(),
                $lte: fromDate.endOf("day").toDate(),
              },
            },
          ],
        })
          .populate("user", "name")
          .populate("kelas")
          .skip((page - 1) * limit)
          .limit(limit);

        if (toDate) {
          data = await Absensi.find({
            user,
            $and: [
              {
                createdAt: {
                  $gte: fromDate.startOf("day").toDate(),
                  $lte: toDate.endOf("day").toDate(),
                },
              },
            ],
          })
            .populate("user", "name")
            .populate("kelas")
            .skip((page - 1) * limit)
            .limit(limit);
        }
      } else if (kelas) {
        data = await Absensi.find({
          kelas,
        })
          .populate("user", "name")
          .populate("kelas")
          .skip((page - 1) * limit)
          .limit(limit);
      } else if (user) {
        data = await Absensi.find({
          user,
        })
          .populate("user", "name")
          .populate("kelas")
          .skip((page - 1) * limit)
          .limit(limit);
      } else if (fromDate) {
        data = await Absensi.find({
          createdAt: {
            $gte: fromDate.startOf("day").toDate(),
            $lte: fromDate.endOf("day").toDate(),
          },
        })
          .populate("user", "name")
          .populate("kelas")
          .skip((page - 1) * limit)
          .limit(limit);

        if (toDate) {
          data = await Absensi.find({
            createdAt: {
              $gte: fromDate.startOf("day").toDate(),
              $lte: toDate.endOf("day").toDate(),
            },
          })
            .populate("user", "name")
            .populate("kelas")
            .skip((page - 1) * limit)
            .limit(limit);
        }
      } else {
        data = await Absensi.find()
          .populate("user", "name")
          .populate("kelas")
          .skip((page - 1) * limit)
          .limit(limit);
      }

      result = {
        data,
        "total data": totalData,
      };

      return response(200, result, "Berhasil get all absensi", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  showByClass: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const kelas = req.params.kelas;

      let data = [];

      const targetClass = await Kelas.findById(kelas);

      const jadwal = targetClass.jadwal;
      const absensi = targetClass.absensi;

      for (let l = 0; l < targetClass.peserta.length; l++) {
        for (let i = 0; i < jadwal.length; i++) {
          let hadir = false;

          const user = await User.findById(targetClass.peserta[l].user);

          const absen = await Absensi.find({
            user: targetClass.peserta[l].user,
            $and: [
              {
                kelas,
              },
            ],
          }).populate("user kelas");

          for (let j = 0; j < absen.length; j++) {
            if (
              moment(absen[j].date).format("YYYY-MM-DD") ==
              moment(jadwal[i].tanggal).format("YYYY-MM-DD")
            ) {
              let time = "";

              for (let k = 0; k < absensi.length; k++) {
                if (absensi[k].name == absen[j].absenName) {
                  time = absensi[k].time;

                  break;
                }
              }

              data.push({
                jadwal: moment(jadwal[i].tanggal).format("YYYY-MM-DD"),
                abesnTime: time,
                data: absen[j],
              });

              hadir = true;
            }
          }

          if (!hadir) {
            for (let k = 0; k < absensi.length; k++) {
              data.push({
                jadwal: moment(jadwal[i].tanggal).format("YYYY-MM-DD"),
                user,
                kelas: targetClass,
                absenName: absensi[k].name,
                abesnTime: absensi[k].time,
                status: "tidak hadir",
                time: "",
              });
            }
          }
        }
      }

      data = paginateArray(data, limit, page);

      result = {
        data,
        "total data": data.length,
      };

      return response(200, result, "Berhasil get absensi", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  show: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const kelas = req.params.kelas;
      const user = req.params.user;

      let data = [];

      const targetClass = await Kelas.findById(kelas);
      const targetUser = await User.findById(user);

      const jadwal = targetClass.jadwal;
      const absensi = targetClass.absensi;

      for (let i = 0; i < jadwal.length; i++) {
        let hadir = false;

        const absen = await Absensi.find({
          user,
          $and: [
            {
              kelas,
            },
          ],
        }).populate("user kelas");

        for (let j = 0; j < absen.length; j++) {
          if (
            moment(absen[j].createdAt).format("YYYY-MM-DD") ==
            moment(jadwal[i].tanggal).format("YYYY-MM-DD")
          ) {
            // let time = "";

            // for (let k = 0; k < absensi.length; k++) {
            //   if (absensi[k].name == absen[j].absenName) {
            //     time = absensi[k].time;

            //     break;
            //   }
            // }

            // data.push({
            //   jadwal: moment(jadwal[i].tanggal).format("YYYY-MM-DD"),
            //   abesnTime: time,
            //   data: absen[j],
            // });

            data.push({
              jadwal: moment(jadwal[i].tanggal).format("YYYY-MM-DD"),
              user: targetUser,
              kelas: targetClass,
              absenName: absen[j].name,
              abesnTime: absen[j].time,
              status: absen[j].status,
              time: absen[j].time,
            });

            hadir = true;
          }
        }

        if (!hadir) {
          for (let k = 0; k < absensi.length; k++) {
            data.push({
              jadwal: moment(jadwal[i].tanggal).format("YYYY-MM-DD"),
              user: targetUser,
              kelas: targetClass,
              absenName: absensi[k].name,
              abesnTime: absensi[k].time,
              status: "Tidak hadir",
              time: "",
            });
          }
        }
      }

      data = paginateArray(data, limit, page);

      result = {
        data,
        "total data": data.length,
      };

      return response(200, result, "Berhasil get absensi", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
      const { user, kelas, absenName, time } = req.body;

      const absenKelas = await Kelas.findOne({
        _id: kelas,
        $and: [
          {
            absensi: {
              $elemMatch: {
                name: absenName,
              },
            },
          },
        ],
      });

      let absenTime;

      absenKelas.absensi.map((a, i) => {
        if (a.name == absenName) {
          absenTime = a;
        }
      });

      absenTime = absenTime.time;
      // Get the current date
      var currentDate = new Date();

      // Define your time strings in 24-hour format
      var timeString1 = absenTime.split("-")[0];
      var timeString2 = absenTime.split("-")[1];

      // Split the time strings into hours and minutes
      var [hours1, minutes1] = timeString1.split(":");
      var [hours2, minutes2] = timeString2.split(":");

      // Create Date objects for today with the given time strings
      var date1 = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        hours1,
        minutes1,
        0
      );

      var date2 = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        hours2,
        minutes2,
        0
      );

      const hasDoneToday = await Absensi.findOne({
        user,
        $and: [
          {
            kelas,
          },
          {
            absenName,
          },
          {
            createdAt: {
              $gte: moment().startOf("day").toDate(),
              $lte: moment().endOf("day").toDate(),
            },
          },
        ],
      });

      if (hasDoneToday) {
        return response(403, {}, "Anda sudah absen hari ini", res);
      }

      // Compare Date objects
      if (currentDate >= date1 && currentDate <= date2) {
        let absen = new Absensi({
          user,
          kelas,
          absenName,
          time,
          status: "hadir",
        });
        absen.save({ session });
      } else {
        let absen = new Absensi({
          user,
          kelas,
          absenName,
          time,
          status: "terlambat",
        });
        absen.save({ session });
        // return response(403, {}, "Absen Tidak diakui", res);
      }

      session.commitTransaction();
      return response(200, {}, "Absensi berhasil dimasukan", res);
    } catch (error) {
      session.abortTransaction();
      return response(500, error, error.message, res);
    } finally {
      session.endSession();
    }
  },

  update: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const id = req.params.id;

      let { user, kelas, absenName, time } = req.body;

      const oldData = await Absensi.findById(id);

      if (!user) {
        user = oldData.user;
      }

      if (!kelas) {
        kelas = oldData.kelas;
      }

      if (!absenName) {
        absenName = oldData.absenName;
      }

      if (!time) {
        time = oldData.time;
      }

      await Absensi.findByIdAndUpdate(
        id,
        {
          user,
          kelas,
          absenName,
          time,
        },
        {
          new: true,
        }
      );

      return response(200, {}, "Absensi berhasil diperbaharui", res);
    } catch (error) {
      session.abortTransaction();
      return response(500, error, error.message, res);
    } finally {
      session.endSession();
    }
  },

  destroy: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const id = req.params.id;

      await Absensi.findByIdAndRemove(id);

      return response(200, {}, "Absensi berhasil diperbaharui", res);
    } catch (error) {
      session.abortTransaction();
      return response(500, error, error.message, res);
    } finally {
      session.endSession();
    }
  },

  getData: async (req, res) => {
    try {
      const { date, kelas } = req.params;

      const findKelasBySlug = await Kelas.findOne({ slug: kelas });

      const absenPeserta = await Absensi.find({
        date: date,
        kelas: findKelasBySlug._id,
      })
        .populate("user", "name")
        .populate("kelas", "nama");
      return response(200, absenPeserta, "Absensi berhasil didapat", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },

  todayDataByClass: async (req, res) => {
    try {
      const { kelas } = req.params;

      const classAvailable = await Kelas.findById(kelas);

      if (!classAvailable) {
        return response(404, {}, "Kelas tidak ditemukan", res);
      }

      const today = new Date();

      let data = [];

      await Promise.all(
        classAvailable.peserta.map(async (p) => {
          const user = await User.findById(p.user);

          const hadir = await Absensi.findOne({
            date: convertDate(today),
            kelas,
            user: p.user,
          });

          data.push({
            name: user.name,
            hadir: hadir ? true : false,
          });
        })
      );

      return response(200, data, "Absensi hari ini berhasil didapat", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },
};
