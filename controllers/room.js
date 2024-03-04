const response = require("../respons/response");

const Room = require("../models/room");
const User = require("../models/user");

module.exports = {
  index: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);
      const user = req.query.user;

      let ids = [req.user.id];

      let totalData = await Room.find({
        users: { $in: ids },
      }).countDocuments();

      let data = await Room.find({
        users: { $in: ids },
      })
        .populate("users", "name")
        .populate("lastChat");

      if (user) {
        const userData = await User.find();

        const len = user.length;

        userData.map((u) => {
          if (u.name.substring(0, len) == user) {
            ids.push(u._id);
          }

          if (u.email.substring(0, len) == user) {
            ids.push(u._id);
          }
        });

        totalData = await Room.find({
          users: { $in: ids },
        }).countDocuments();

        data = await Room.find({
          users: { $in: ids },
        })
          .populate("users", "name")
          .populate("lastChat");
      }

      if (isNaN(isPaginate)) {
        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get kategori berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      data = await Room.find({
        users: { $in: req.user.id },
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("users", "name")
        .populate("lastChat")
        .sort({ updatedAt: -1 });

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all room", res);
    } catch (error) {
      console.log(error);

      response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    try {
      const user = req.body.user;

      const userCheck = await User.findById(user);

      if (!userCheck) {
        return response(400, null, "User tidak tersedia", res);
      }

      const room = await Room.findOne({
        users: [req.user.id, user],
      });

      if (room) {
        return response(400, null, "Room sudah tersedia", res);
      }

      let result = await Room.create({
        users: [req.user.id, user],
      });

      result = await Room.findById(result._id)
        .populate("users", "name")
        .populate("lastChat");

      return response(200, result, "Room berhasil ditambahkan", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },
};
