const ClassEnrollment = require("../models/pengajuanKelas");
const response = require("../respons/response");
const _ = require("lodash");

module.exports = {
  index: async (req, res) => {
    try {
      let { page, limits, isPaginate } = req.query;

      const totalData = await ClassEnrollment.find({
        // status: {
        //   $ne: "approved",
        // },
      }).countDocuments();

      if (isPaginate === 0) {
        const data = await ClassEnrollment.find({
          //   status: {
          //     $ne: "approved",
          //   },
        })
          .populate("user", "name")
          .populate("class", "nama");

        result = {
          data: data,
          "total data": totalData,
        };

        response(200, results, "get materi");
        return;
      }

      page = parseInt(page) || 1;
      limits = parseInt(limits) || 6;

      const data = await ClassEnrollment.find({
        // status: {
        //   $ne: "approved",
        // },
      })
        .populate("user", "name")
        .populate("class", "nama")
        .skip((page - 1) * limits)
        .limit(limits);

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Get all pengajuan kelas", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  approve: async (req, res) => {
    try {
      const { id } = req.params;

      let data = await ClassEnrollment.findById(id);

      if (!data) {
        return response(400, {}, "Data not found", res);
      } else if (data.status !== "pending") {
        return response(400, {}, "Data has been reviewed", res);
      }

      data = await ClassEnrollment.findByIdAndUpdate(
        id,
        {
          status: "approved",
        },
        {
          new: true,
        }
      );

      return response(200, data, "Get all pengajuan kelas", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },

  reject: async (req, res) => {
    try {
      const { id } = req.params;

      let data = await ClassEnrollment.findById(id);

      if (!data) {
        return response(400, {}, "Data not found", res);
      } else if (data.status !== "pending") {
        return response(400, {}, "Data has been reviewed", res);
      }

      data = await ClassEnrollment.findByIdAndUpdate(
        id,
        {
          status: "rejected",
        },
        {
          new: true,
        }
      );

      return response(200, data, "Get all pengajuan kelas", res);
    } catch (error) {
      return response(500, error, error.message, res);
    }
  },
};
