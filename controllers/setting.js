const Setting = require("../models/setting");
const OrganizationStructure = require("../models/organizationStructure");
const User = require("../models/user");

const response = require("../respons/response");

require("dotenv").config();

module.exports = {
  index: async (req, res) => {
    try {
      const data = await Setting.findOne().populate("instructors", "name");

      return response(200, data, "berhasil get setting", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  deleteOrganizationStructure: async (req, res) => {
    try {
      const id = req.params.id;

      const check = await OrganizationStructure.findById(id);

      if (!check) {
        return response(400, error, "Data tidak ditemukan", res);
      }

      await OrganizationStructure.findByIdAndRemove(id);

      return response(200, null, "Struktur Organisasi berhasil dihapus", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  organizationStructureList: async (req, res) => {
    try {
      const data = await OrganizationStructure.find();

      return response(200, data, "berhasil get struktur organisasi", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  storeOrganizationStructure: async (req, res) => {
    try {
      let picture = req.body.picture;

      const name = req.body.name;
      const position = req.body.position;
      const star = req.body.star;
      const classNumber = req.body.class;
      const student = req.body.student;

      if (!picture) picture = null;

      data = await OrganizationStructure.create({
        picture,
        name,
        position,
        star,
        class: classNumber,
        student,
      });

      return response(
        200,
        data,
        "Struktur Organisasi berhasil ditambahkan",
        res
      );
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  update: async (req, res) => {
    try {
      const setting = await Setting.findOne();

      let banner = req.body.banner;

      const about = req.body.about;
      const our_class = req.body.our_class;
      const instructors = req.body.instructors;
      const youtube_link = req.body.youtube_link;
      const testimony = req.body.testimony;
      const class_count = req.body.class_count;
      const instructor_count = req.body.instructor_count;
      const participant_count = req.body.participant_count;

      let data;

      if (!banner) banner = null;

      instructors.map(async (row) => {
        const valid = await User.findById(row, {
          role: 2,
        });

        if (!valid) {
          return response(400, null, "Instruktur tidak terdaftar", res);
        }
      });

      if (!setting) {
        data = await Setting.create({
          banner,
          about,
          our_class,
          instructors,
          youtube_link,
          testimony,
          class_count,
          instructor_count,
          participant_count,
        });
      } else {
        data = await Setting.findByIdAndUpdate(
          setting._id,
          {
            banner,
            about,
            our_class,
            instructors,
            youtube_link,
            testimony,
            class_count,
            instructor_count,
            participant_count,
          },
          {
            new: true,
          }
        );
      }

      return response(200, data, "Setting berhasil diperbaharui", res);
    } catch (error) {
      return response(500, null, error.message, res);
    }
  },

  updateOrganizationStructure: async (req, res) => {
    try {
      const id = req.params.id;

      const check = await OrganizationStructure.findById(id);

      if (!check) {
        return response(400, error, "Data tidak ditemukan", res);
      }

      let picture = req.body.picture;

      const name = req.body.name;
      const position = req.body.position;
      const star = req.body.star;
      const classNumber = req.body.class;
      const student = req.body.student;

      if (!picture) picture = null;

      data = await OrganizationStructure.findByIdAndUpdate(
        id,
        {
          picture,
          name,
          position,
          star,
          class: classNumber,
          student,
        },
        {
          new: true,
        }
      );

      return response(
        200,
        data,
        "Struktur Organisasi berhasil diperbaharui",
        res
      );
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },
};
