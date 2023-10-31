const Kelas = require("../models/kelas");
const Absensi = require("../models/absensiPeserta");
const response = require("../respons/response");
const mongoose = require("mongoose");
const moment = require("moment");

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

      let data;
      let totalData;

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
              },
            ],
          }).countDocuments();
        }
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
        });
        absen.save({ session });
      } else {
        return response(403, {}, "Absen Tidak diakui", res);
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
};
