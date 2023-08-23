const response = require("../respons/response");

const Chat = require("../models/chat");
const Room = require("../models/room");

module.exports = {
  index: async (req, res) => {
    try {
      const id = req.params.id;

      const isPaginate = parseInt(req.query.paginate);

      const room = await Room.findById(id);

      if (!room) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      let valid = false;

      room.users.map((r) => {
        if (req.user.id == r) {
          valid = true;
        }
      });

      if (!valid && req.user.role !== 1) {
        return response(400, null, "Forbidden", res);
      }

      if (isPaginate === 0) {
        const totalData = await Chat.find({
          room: id,
        }).countDocuments();

        const data = await Chat.find({
          room: id,
        }).populate("sender", "name");

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get kategori berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const totalData = await Chat.find({
        room: id,
      }).countDocuments();

      const data = await Chat.find({
        room: id,
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("sender", "name");

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all chat", res);
    } catch (error) {
      console.log(error);

      response(500, error, "Server error", res);
    }
  },

  read: async (req, res) => {
    try {
      const id = req.params.id;

      const chat = await Chat.findById(id);

      if (!chat) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      const room = await Room.findById(chat.room);

      if (!room) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      let valid = false;

      room.users.map((r) => {
        if (req.user.id == r) {
          valid = true;
        }
      });

      if (!valid && req.user.role !== 1) {
        return response(400, null, "Forbidden", res);
      }

      await Chat.findByIdAndUpdate(id, {
        read: true,
      });

      const result = await Chat.findById(id).populate("sender", "name");

      return response(200, result, "Chat berhasil di read", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    try {
      const chat = req.body.chat;

      if (!chat) {
        return response(400, null, "Mohon isi chat", res);
      }

      const id = req.params.id;

      const room = await Room.findById(id);

      if (!room) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      let valid = false;

      room.users.map((r) => {
        if (req.user.id == r) {
          valid = true;
        }
      });

      if (!valid && req.user.role !== 1) {
        return response(400, null, "Forbidden", res);
      }

      await Chat.create({
        sender: req.user.id,
        room: id,
        chat,
      });

      return response(200, { chat }, "Berhasil menambahkan chat", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },
};
