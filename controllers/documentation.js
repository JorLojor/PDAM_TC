const Documentation = require("../models/documentation");
const response = require("../respons/response");

const fs = require("fs");
const moment = require("moment");
const path = require("path");

module.exports = {
  index: async (req, res) => {
    try {
      const isPaginate = parseInt(req.query.paginate);

      let data;
      let totalData = 0;

      totalData = await Documentation.countDocuments();

      if (isPaginate === 0) {
        data = await Documentation.find();

        result = {
          data: data,
          "total data": totalData,
        };
        response(200, result, "get dokumentasi berhasil", res);
        return;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      data = await Documentation.find()
        .skip((page - 1) * limit)
        .limit(limit);

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Berhasil get all dokumentasi", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  destroy: async (req, res) => {
    const id = req.params.id;

    try {
      const result = await Documentation.findByIdAndRemove(id);

      response(200, result, "Dokumentasi berhasil dihapus", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  show: async (req, res) => {
    try {
      const id = req.params.id;

      const data = await Documentation.findById(id);

      if (data) {
        response(200, data, "Berhasil get single dokumentasi", res);
      } else {
        response(400, data, "dokumentasi tidak ditemukan", res);
      }
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    const { caption } = req.fields;
    const file = req.files["file"];

    if (!file) {
      return response(400, {}, "Mohon upload file", res);
    } else if (!caption) {
      return response(400, {}, "Mohon isi caption", res);
    }

    try {
      const today = new Date().toISOString().slice(0, 10);

      const folder = path.join(
        __dirname,
        "..",
        "upload",
        "documentation",
        today
      );

      await fs.promises.mkdir(folder, { recursive: true });

      const format = "YYYYMMDDHHmmss";

      const date = new Date();

      const dateName = moment(date).format(format);

      let ext;

      if (file.type == "image/png") {
        ext = "png";
      } else if (file.type == "image/jpg") {
        ext = "jpg";
      } else if (file.type == "image/jpeg") {
        ext = "jpeg";
      } else if (file.type == "video/mp4") {
        ext = "mp4";
      } else {
        return response(400, {}, "Mohon upload gambar / video", res);
      }

      const newPath = folder + `/documentation${dateName}.${ext}`;

      var oldPath = file.path;

      fs.promises.copyFile(oldPath, newPath, 0, function (err) {
        if (err) throw err;
      });

      const filePath = `/upload/documentation/${today}/documentation${dateName}.${ext}`;

      const data = await Documentation.create({
        file: filePath,
        caption,
      });

      response(200, data, "Dokumentasi berhasil di buat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    let { caption } = req.fields;
    const file = req.files["file"];

    const oldData = await Documentation.findById(id);

    if (!oldData) {
      return response(400, {}, "Dokumentasi tidak ditemukan", res);
    }

    try {
      if (!caption) {
        caption = oldData.caption;
      }

      let filePath = oldData.file;

      if (file != null) {
        const today = new Date().toISOString().slice(0, 10);

        const folder = path.join(
          __dirname,
          "..",
          "upload",
          "documentation",
          today
        );

        await fs.promises.mkdir(folder, { recursive: true });

        const format = "YYYYMMDDHHmmss";

        const date = new Date();

        const dateName = moment(date).format(format);

        let ext;

        if (file.type == "image/png") {
          ext = "png";
        } else if (file.type == "image/jpg") {
          ext = "jpg";
        } else if (file.type == "image/jpeg") {
          ext = "jpeg";
        } else if (file.type == "video/mp4") {
          ext = "mp4";
        } else {
          return response(400, {}, "Mohon upload gambar / video", res);
        }

        const newPath = folder + `/documentation${dateName}.${ext}`;

        var oldPath = file.path;

        fs.promises.copyFile(oldPath, newPath, 0, function (err) {
          if (err) throw err;
        });

        filePath = `/upload/documentation/${today}/documentation${dateName}.${ext}`;
      }

      const data = await Documentation.findByIdAndUpdate(
        id,
        {
          file: filePath,
          caption,
        },
        {
          new: true,
        }
      );

      response(200, data, "Dokumentasi berhasil di perbaharui", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
};
