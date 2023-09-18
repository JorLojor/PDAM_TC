const Setting = require("../models/setting");
const OrganizationStructure = require("../models/organizationStructure");
const User = require("../models/user");

const fs = require("fs");
const moment = require("moment");
const path = require("path");

const response = require("../respons/response");

require("dotenv").config();

module.exports = {
  index: async (req, res) => {
    try {
      const data = await Setting.findOne().populate({
        path: "instructors",
        select: "-password",
        populate: {
          path: "rating",
        },
      });

      return response(200, data, "berhasil get setting", res);
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

  update: async (req, res) => {
    try {
      const setting = await Setting.findOne();

      let banner = [];

      if (req.files) {
        req.files.map((row) => {
          banner.push(row.path.split("upload").pop());
        });
      }

      const about = req.body.about;
      const our_class = req.body.our_class;
      // ieu dites make raw json
      const instructors = req.files
        ? JSON.parse(req.body.instructors)
        : req.body.instructors;
      // ieu dites make raw json
      const youtube_link = req.body.youtube_link;
      let testimony = req.body.testimoni;
      const class_count = req.body.class_count;
      const instructor_count = req.body.instructor_count;
      const participant_count = req.body.participant_count;

      let array = testimony.split(/\s*\,\s*/g);

      testimony = [];

      array.map((a, i) => {
        const name = a.substring(0, a.indexOf(" -"));
        const title = a.substring(a.indexOf("- ") + 2, a.lastIndexOf(" ("));
        const value = a.substring(a.indexOf("(") + 1, a.lastIndexOf(")"));

        testimony.push({
          name,
          title,
          value,
        });
      });

      let data;

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
      console.log(error);
      return response(500, null, error.message, res);
    }
  },

  updateOrganizationStructure: async (req, res) => {
    try {
      await OrganizationStructure.deleteMany();
      const { countData } = req.fields;

      const currentData = await OrganizationStructure.find();

      let existing = [];
      let registered = [];

      currentData.map((data) => {
        existing.push(data._id);
      });

      let j = 0;

      for (let i = 0; i < countData; i++) {
        const id = `id${i}`;
        const name = `name${i}`;
        const position = `position${i}`;
        const bio = `bio${i}`;
        const picture = `picture${i}`;

        const dataId = req.fields[id];
        const dataName = req.fields[name];
        const dataPosition = req.fields[position];
        const dataBio = req.fields[bio];
        const dataPicture = req.fields[picture];

        if (dataId) {
          const oldData = await OrganizationStructure.findById(dataId);

          if (!oldData) {
            return response(404, {}, "Data tidak ditemukan", res);
          }

          if (dataPicture == 1) {
            await OrganizationStructure.findByIdAndUpdate(
              dataId,
              {
                name: dataName,
                position: dataPosition,
                bio: dataBio,
              },
              {
                new: true,
              }
            );
          } else {
            if (req.files.picture[j] != null) {
              const today = new Date().toISOString().slice(0, 10);

              const folder = path.join(
                __dirname,
                "..",
                "upload",
                "organization-structure",
                today
              );

              await fs.promises.mkdir(folder, { recursive: true });

              const format = "YYYYMMDDHHmmss";

              const date = new Date();

              const dateName = moment(date).format(format);

              let ext;

              if (req.files.picture[j].type == "image/png") {
                ext = "png";
              } else if (req.files.picture[j].type == "image/jpg") {
                ext = "jpg";
              } else if (req.files.picture[j].type == "image/jpeg") {
                ext = "jpeg";
              }

              const newPath =
                folder + `/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

              var oldPath = req.files.picture[j].path;

              fs.promises.copyFile(oldPath, newPath, 0, function (err) {
                if (err) throw err;
              });

              const picture = `${process.env.url}upload/organization-structure/${today}/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

              await OrganizationStructure.findByIdAndUpdate(
                dataId,
                {
                  picture,
                  name: dataName,
                  position: dataPosition,
                  bio: dataBio,
                },
                {
                  new: true,
                }
              );

              j++;
            } else {
              if (req.files.picture != null) {
                const today = new Date().toISOString().slice(0, 10);

                const folder = path.join(
                  __dirname,
                  "..",
                  "upload",
                  "organization-structure",
                  today
                );

                await fs.promises.mkdir(folder, { recursive: true });

                const format = "YYYYMMDDHHmmss";

                const date = new Date();

                const dateName = moment(date).format(format);

                let ext;

                if (req.files.picture.type == "image/png") {
                  ext = "png";
                } else if (req.files.picture.type == "image/jpg") {
                  ext = "jpg";
                } else if (req.files.picture.type == "image/jpeg") {
                  ext = "jpeg";
                }

                const newPath =
                  folder +
                  `/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

                var oldPath = req.files.picture.path;

                fs.promises.copyFile(oldPath, newPath, 0, function (err) {
                  if (err) throw err;
                });

                const picture = `${process.env.url}upload/organization-structure/${today}/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

                await OrganizationStructure.findByIdAndUpdate(
                  dataId,
                  {
                    picture,
                    name: dataName,
                    position: dataPosition,
                    bio: dataBio,
                  },
                  {
                    new: true,
                  }
                );
              } else {
                return response(400, {}, "Mohon upload gambar", res);
              }
            }
          }

          registered.push(dataId);
        } else {
          if (req.files.picture[j] != null) {
            const today = new Date().toISOString().slice(0, 10);

            const folder = path.join(
              __dirname,
              "..",
              "upload",
              "organization-structure",
              today
            );

            await fs.promises.mkdir(folder, { recursive: true });

            const format = "YYYYMMDDHHmmss";

            const date = new Date();

            const dateName = moment(date).format(format);

            let ext;

            if (req.files.picture[j].type == "image/png") {
              ext = "png";
            } else if (req.files.picture[j].type == "image/jpg") {
              ext = "jpg";
            } else if (req.files.picture[j].type == "image/jpeg") {
              ext = "jpeg";
            }

            const newPath =
              folder + `/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

            var oldPath = req.files.picture[j].path;

            fs.promises.copyFile(oldPath, newPath, 0, function (err) {
              if (err) throw err;
            });

            const picture = `${process.env.url}upload/organization-structure/${today}/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

            const newData = await OrganizationStructure.create({
              picture,
              name: dataName,
              position: dataPosition,
              bio: dataBio,
            });

            j++;

            registered.push(newData._id);
          } else {
            return response(400, {}, "Mohon upload gambar", res);
          }
        }
      }

      if (existing.length > 0 && registered.length > 0) {
        const tobeDeleted = await OrganizationStructure.find({
          _id: {
            $nin: registered,
          },
        });

        console.log(tobeDeleted, registered);

        if (tobeDeleted.length > 0) {
          tobeDeleted.map(async (t) => {
            await OrganizationStructure.findByIdAndDelete(t._id);
          });
        }
      }

      const data = await OrganizationStructure.find();

      return response(200, data, "berhasil update struktur organisasi", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },
};
