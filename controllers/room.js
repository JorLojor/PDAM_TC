const response = require("../respons/response");

const Chat = require("../models/chat");
const Room = require("../models/room");
const User = require("../models/user");

module.exports = {
  index: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);

      if (isPaginate === 0) {
        const totalData = await Chat.find({
          room: id,
        }).countDocuments();

        const data = await Room.find({
          users: { $in: req.user.id },
        })
          .populate("users", "name")
          .populate("lastChat");

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get kategori berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const totalData = await Room.find({
        users: { $in: req.user.id },
      }).countDocuments();

      const data = await Room.find({
        users: { $in: req.user.id },
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("users", "name")
        .populate("lastChat");

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
      const room = await Room.find({
        users: { $in: req.user.id },
      });

      if (room) {
        return response(400, null, "Room sudah tersedia", res);
      }

      const admin = await User.find({
        role: 1,
      });

      let result = await Room.create({
        users: [req.user.id, admin._id],
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
