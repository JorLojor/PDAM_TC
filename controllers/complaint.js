const response = require("../respons/response");
const Complaint = require("../models/complaint");

module.exports = {
  index: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);

      if (isPaginate === 0) {
        const totalData = await Complaint.countDocuments();

        const data = await Complaint.find().populate("user", "name");

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get kategori berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const totalData = await Complaint.countDocuments();

      const data = await Complaint.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "name");

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all complain", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    try {
      const message = req.body.message;
      const subject = req.body.subject;

      if (!subject) {
        return response(400, null, "Mohon isi subjek", res);
      } else if (!message) {
        return response(400, null, "Mohon isi pesan", res);
      }

      let result = await Complaint.create({
        user: req.user._id,
        message,
        subject,
      });

      return response(200, result, "Berhasil menambahkan complain", res);
    } catch (error) {
      console.log(error);
      return response(500, error, "Server error", res);
    }
  },
};
