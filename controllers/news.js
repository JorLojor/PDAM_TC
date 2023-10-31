const Setting = require("../models/setting");
const OrganizationStructure = require("../models/organizationStructure");
const News = require("../models/news");

const fs = require("fs");
const moment = require("moment");
const path = require("path");

const response = require("../respons/response");

require("dotenv").config();

module.exports = {
  index: async (req, res) => {
    try {
      let { page, limits, isPaginate } = req.query;

      const totalData = await News.countDocuments();

      if (isPaginate === 0) {
        const data = await News.find()
          .populate({
            path: "user",
            select: "-password",
          })
          .sort({ createdAt: -1 });

        result = {
          data: data,
          "total data": totalData,
        };

        return response(200, results, "get berita");
      }

      page = parseInt(page) || 1;
      limits = parseInt(limits) || 4;

      const data = await News.find()
        .populate({
          path: "user",
          select: "-password",
        })
        .skip((page - 1) * limits)
        .limit(limits)
        .sort({ createdAt: -1 });

      result = {
        data: data,
        "total data": totalData,
      };

      return response(200, data, "berhasil get berita", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  destroy: async (req, res) => {
    try {
      const id = req.params.id;

      const data = await News.findOneAndRemove(id);

      return response(200, data, "berhasil hapus berita", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  publishedNewsList: async (req, res) => {
    try {
      let { page, limits, isPaginate } = req.query;

      const totalData = await News.find({
        status: 1,
      }).countDocuments();

      if (isPaginate === 0) {
        const data = await News.find({
          status: 1,
        })
          .populate({
            path: "user",
            select: "-password",
          })
          .sort({ createdAt: -1 });

        result = {
          data: data,
          "total data": totalData,
        };

        return response(200, results, "get berita");
      }

      page = parseInt(page) || 1;
      limits = parseInt(limits) || 4;

      const data = await News.find({
        status: 1,
      })
        .populate({
          path: "user",
          select: "-password",
        })
        .skip((page - 1) * limits)
        .limit(limits)
        .sort({ createdAt: -1 });

      result = {
        data: data,
        "total data": totalData,
      };

      return response(200, data, "berhasil get berita", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  show: async (req, res) => {
    try {
      const id = req.params.id;

      const data = await News.findById(id, {}).populate({
        path: "user",
        select: "-password",
      });

      if (!data) {
        return response(400, {}, "Berita tidak ditemukan", res);
      }

      return response(200, data, "berhasil get berita", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  store: async (req, res) => {
    try {
      const title = req.fields[`title`];
      const content = req.fields[`content`];
      const status = req.fields[`status`];

      let picture = req.files[`picture`];

      if (!title) {
        return response(400, {}, "Mohon isi judul", res);
      } else if (!content) {
        return response(400, {}, "Mohon isi berita", res);
      } else if (!status) {
        return response(400, {}, "Mohon isi status", res);
      } else if (picture == null) {
        return response(400, {}, "Mohon upload gambar", res);
      }

      const today = new Date().toISOString().slice(0, 10);

      const folder = path.join(__dirname, "..", "upload", "news", today);

      await fs.promises.mkdir(folder, { recursive: true });

      const format = "YYYYMMDDHHmmss";

      const date = new Date();

      const dateName = moment(date).format(format);

      let ext;

      if (picture.type == "image/png") {
        ext = "png";
      } else if (picture.type == "image/jpg") {
        ext = "jpg";
      } else if (picture.type == "image/jpeg") {
        ext = "jpeg";
      }

      const newPath = folder + `/news${dateName}${dateName}.${ext}`;

      var oldPath = picture.path;

      fs.promises.copyFile(oldPath, newPath, 0, function (err) {
        if (err) throw err;
      });

      picture = `/upload/news/${today}/news${dateName}${dateName}.${ext}`;

      const data = await News.create({
        title,
        content,
        picture,
        status,
        user: req.user.id,
      });

      return response(200, data, "berhasil menambahkan berita", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;

      const title = req.fields[`title`];
      const content = req.fields[`content`];
      const status = req.fields[`status`];

      let picture = req.files[`picture`];

      if (!title) {
        return response(400, {}, "Mohon isi judul", res);
      } else if (!content) {
        return response(400, {}, "Mohon isi berita", res);
      } else if (!status) {
        return response(400, {}, "Mohon isi status", res);
      }

      const oldData = await News.findById(id);

      if (!oldData) {
        return response(400, {}, "Berita tidak ditemukan", res);
      }

      if (picture) {
        const today = new Date().toISOString().slice(0, 10);

        const folder = path.join(__dirname, "..", "upload", "news", today);

        await fs.promises.mkdir(folder, { recursive: true });

        const format = "YYYYMMDDHHmmss";

        const date = new Date();

        const dateName = moment(date).format(format);

        let ext;

        if (picture.type == "image/png") {
          ext = "png";
        } else if (picture.type == "image/jpg") {
          ext = "jpg";
        } else if (picture.type == "image/jpeg") {
          ext = "jpeg";
        }

        const newPath = folder + `/news${dateName}${dateName}.${ext}`;

        var oldPath = picture.path;

        fs.promises.copyFile(oldPath, newPath, 0, function (err) {
          if (err) throw err;
        });

        picture = `/upload/news/${today}/news${dateName}${dateName}.${ext}`;
      } else {
        picture = oldData.data;
      }

      let data = await News.findByIdAndUpdate(
        id,
        {
          title,
          content,
          picture,
          status,
        },
        {
          new: true,
        }
      );

      data = await News.findById(id, {}).populate({
        path: "user",
        select: "-password",
      });

      return response(200, data, "berhasil menyunting berita", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },
};
