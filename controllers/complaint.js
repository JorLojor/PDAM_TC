const response = require("../respons/response");

const Chat = require("../models/chat");
const Complaint = require("../models/complaint");
const Room = require("../models/room");

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
      console.log(error);

      response(500, error, "Server error", res);
    }
  },

  followUp: async (req, res) => {
    try {
      const id = req.params.id;

      const complaint = await Complaint.findById(id);

      if (!complaint) {
        return response(400, null, "Data tidak ditemukan", res);
      } else if (complaint.status == true) {
        return response(400, null, "Komplain sudah di follow up", res);
      }

      await Complaint.findByIdAndUpdate(id, {
        status: true,
      });

      const room = await Room.create({
        users: [complaint.user, req.user.id],
        complain: id,
      });

      const chat = await Chat.create({
        sender: complaint.user,
        room: room._id,
        chat: complaint.message,
      });

      await Room.findByIdAndUpdate(room.id, {
        lastChat: chat._id,
      });

      const result = await Room.findById(room.id)
        .populate("lastChat")
        .populate("users", "name");

      return response(200, result, "Berhasil Follow up complain", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  getRoom: async (req, res) => {
    try {
      const id = req.params.id;

      let room = await Room.find({ complain: id });

      if (!room) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      room = await Room.find({ complain: id })
        .populate("lastChat", "sender chat read createdAt")
        .populate("users", "name");

      room = await Chat.populate(room, {
        path: "lastChat.sender",
        select: "name",
      });

      return response(200, room, "Room ditemukan", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
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
        user: req.user.id,
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
