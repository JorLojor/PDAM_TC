const Setting = require("../models/setting");
const OrganizationStructure = require("../models/organizationStructure");
const Testimony = require("../models/testimony");
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
      }).populate({
        path: "kelas",
        select: "nama kategori image",
        populate: {
          path: "kategori",
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

  testimonyList: async (req, res) => {
    try {
      const data = await Testimony.find();

      return response(200, data, "berhasil get testimoni", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  update: async (req, res) => {
    try {
      const setting = await Setting.findOne();

      let banner = setting.banner.length !== 0 ? setting.banner : [];

      const bannerFiles = req.files["banners"];

      if (bannerFiles) {
        bannerFiles.map((row) => {
          banner.push(row.path.split("upload").pop());
        });
      }

      const about = req.body.about;
      const our_class = req.body.our_class;
      // ieu dites make raw json
      const instructors = req.body.instructors;
      // ieu dites make raw json
      const youtube_link = req.body.youtube_link;
      const class_count = req.body.class_count;
      const instructor_count = req.body.instructor_count;
      const participant_count = req.body.participant_count;
      const kelas = req.body.kelas;

      let data;

      if (instructors && instructors.length !== 0) {
        instructors.map(async (row) => {
          const valid = await User.findById(row, {
            role: 2,
          });

          if (!valid) {
            return response(400, null, "Instruktur tidak terdaftar", res);
          }
        });
      }

      if (!setting) {
        data = await Setting.create({
          banner,
          about,
          our_class,
          instructors,
          youtube_link,
          // testimony,
          class_count,
          instructor_count,
          participant_count,
          kelas
        });
      } else {
        data = await Setting.findByIdAndUpdate(
          setting._id,
          {
            banner: banner ?? setting.banner,
            about: about ?? setting.about,
            our_class: our_class ?? setting.our_class,
            instructors: instructors ?? setting.instructors,
            youtube_link: youtube_link ?? setting.youtube_link,
            class_count: class_count ?? setting.class_count,
            instructor_count: instructor_count ?? setting.instructor_count,
            participant_count: participant_count ?? setting.participant_count,
            kelas,
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

  updateYoutubeLink: async (req, res) => {
    const { youtube_link } = req.body;
    const video_trailer = req.file;
    const today = new Date().toISOString().slice(0, 10);
    try {
      const getSetting = await Setting.find().select("instructors");
      const destinationPath = path.join(
        __dirname,
        "..",
        "upload",
        "video_trailer"
      );
      const oldSetting = getSetting[0];
      const fileExtension = path.extname(video_trailer.originalname);

      // Generate a new file name with a timestamp to avoid collisions
      const newFileName = `video_${today}${fileExtension}`;

      // Rename the uploaded file
      const oldPath = video_trailer.path;
      const newPath = path.join(destinationPath, newFileName);

      fs.renameSync(oldPath, newPath);

      const updateYoutubeLink = await Setting.findByIdAndUpdate(
        oldSetting._id,
        {
          $set: {
            video_trailer: newPath.split("upload")[1].replaceAll("\\", "/"),
            youtube_link,
          },
        },
        { new: true }
      );

      return response(
        200,
        updateYoutubeLink,
        "Berhasil mengupdate youtube link",
        res
      );
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  updateInstructors: async (req, res) => {
    const { instructors } = req.body;
    try {
      const getSetting = await Setting.find().select("instructors");

      const oldSetting = getSetting[0];

      const updateInstructors = await Setting.findByIdAndUpdate(
        oldSetting._id,
        {
          $set: {
            instructors,
          },
        },
        { new: true }
      );

      return response(
        200,
        updateInstructors,
        "Berhasil mengupdate instruktur",
        res
      );
    } catch (error) {
      response(500, null, error.message, res);
    }
  },
  updateKelas: async (req, res) => {
    const { kelas } = req.body;
    try {
      const getSetting = await Setting.find().select("kelas");

      const oldSetting = getSetting[0];

      const updateKelas = await Setting.findByIdAndUpdate(
        oldSetting._id,
        {
          $set: {
            kelas,
          },
        },
        { new: true }
      );

      return response(
        200,
        updateKelas,
        "Berhasil mengupdate kelas",
        res
      );
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  updateAbout: async (req, res) => {
    const { bigTitle, description, itemAbout } = req.body;

    try {
      const getSettings = await Setting.find().select("about");

      let image = null;

      const oldAbout = getSettings[0].about ?? null;

      if (req.file) {
        image = "/upload/" + req.file.path.split("/upload/").pop();
      }

      const newAbout = {
        bigTitle,
        description,
        itemAbout: JSON.parse(itemAbout),
        aboutImage: image ?? getSettings[0].about.aboutImage,
      };

      const updateAbout = await Setting.findByIdAndUpdate(
        getSettings[0]._id,
        {
          $set: {
            about: newAbout,
          },
        },
        { new: true }
      );

      return response(201, updateAbout, "Berhasil mengupdate about!", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  updateOrganizationStructure: async (req, res) => {
    try {
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
        const changepicture = `change_picture${i}`;
        const picture = `picture${i}`;

        const dataId = req.fields[id];
        const dataName = req.fields[name];
        const dataPosition = req.fields[position];
        const dataBio = req.fields[bio];
        const dataChangepicture = req.fields[changepicture];
        const dataPicture = req.files[picture];

        if (dataId.length > 0) {
          const oldData = await OrganizationStructure.findById(dataId);

          if (!oldData) {
            return response(404, {}, "Data tidak ditemukan", res);
          }

          if (dataChangepicture == 1) {
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
            if (dataPicture != null) {
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

              if (dataPicture.type == "image/png") {
                ext = "png";
              } else if (dataPicture.type == "image/jpg") {
                ext = "jpg";
              } else if (dataPicture.type == "image/jpeg") {
                ext = "jpeg";
              }

              const newPath =
                folder + `/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

              var oldPath = dataPicture.path;

              fs.promises.copyFile(oldPath, newPath, 0, function (err) {
                if (err) throw err;
              });

              const picture = `/upload/organization-structure/${today}/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

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

              j = j + 1;
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

                const picture = `/upload/organization-structure/${today}/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

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
          if (dataPicture != null) {
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

            if (dataPicture.type == "image/png") {
              ext = "png";
            } else if (dataPicture.type == "image/jpg") {
              ext = "jpg";
            } else if (dataPicture.type == "image/jpeg") {
              ext = "jpeg";
            }

            const newPath =
              folder + `/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

            var oldPath = dataPicture.path;

            fs.promises.copyFile(oldPath, newPath, 0, function (err) {
              if (err) throw err;
            });

            const picture = `/upload/organization-structure/${today}/strukturOrganisasi${dateName}${i}${dateName}.${ext}`;

            const newData = await OrganizationStructure.create({
              picture,
              name: dataName,
              position: dataPosition,
              bio: dataBio,
            });

            j = j + 1;

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

        // console.log(tobeDeleted, registered);

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

  updateOthersSetting: async (req, res) => {
    const { others } = req.body;

    try {
      const { jumlah_kelas, jumlah_instruktur, jumlah_peserta } = others;

      const getSetting = await Setting.find().select(
        "class_count instructor_count participant_count"
      );

      const oldSetting = getSetting[0];

      const updateOthers = await Setting.findByIdAndUpdate(
        oldSetting._id,
        {
          $set: {
            participant_count: jumlah_peserta,
            class_count: jumlah_kelas,
            instructor_count: jumlah_instruktur,
          },
        },
        { new: true }
      );

      return response(200, updateOthers, "Berhasil merubah data", res);
    } catch (error) {
      response(500, null, error.message, res);
    }
  },

  updateTestimony: async (req, res) => {
    try {
      const { countData } = req.fields;

      const currentData = await Testimony.find();

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
        const testimony = `testimony${i}`;
        const changepicture = `change_picture${i}`;
        const picture = `picture${i}`;

        const dataId = req.fields[id];
        const dataName = req.fields[name];
        const dataPosition = req.fields[position];
        const dataTestimony = req.fields[testimony];
        const dataChangepicture = req.fields[changepicture];
        const dataPicture = req.files[picture];

        if (dataId.length > 0) {
          const oldData = await Testimony.findById(dataId);

          if (!oldData) {
            return response(404, {}, "Data tidak ditemukan", res);
          }

          if (dataChangepicture == 1) {
            await Testimony.findByIdAndUpdate(
              dataId,
              {
                name: dataName,
                position: dataPosition,
                testimony: dataTestimony,
              },
              {
                new: true,
              }
            );
          } else {
            if (dataPicture != null) {
              const today = new Date().toISOString().slice(0, 10);

              const folder = path.join(
                __dirname,
                "..",
                "upload",
                "testimony",
                today
              );

              await fs.promises.mkdir(folder, { recursive: true });

              const format = "YYYYMMDDHHmmss";

              const date = new Date();

              const dateName = moment(date).format(format);

              let ext;

              if (dataPicture.type == "image/png") {
                ext = "png";
              } else if (dataPicture.type == "image/jpg") {
                ext = "jpg";
              } else if (dataPicture.type == "image/jpeg") {
                ext = "jpeg";
              }

              const newPath =
                folder + `/testimony${dateName}${i}${dateName}.${ext}`;

              var oldPath = dataPicture.path;

              fs.promises.copyFile(oldPath, newPath, 0, function (err) {
                if (err) throw err;
              });

              const picture = `/upload/testimony/${today}/testimony${dateName}${i}${dateName}.${ext}`;

              await Testimony.findByIdAndUpdate(
                dataId,
                {
                  picture,
                  name: dataName,
                  position: dataPosition,
                  testimony: dataTestimony,
                },
                {
                  new: true,
                }
              );

              j = j + 1;
            } else {
              if (req.files.picture != null) {
                const today = new Date().toISOString().slice(0, 10);

                const folder = path.join(
                  __dirname,
                  "..",
                  "upload",
                  "testimony",
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
                  folder + `/testimony${dateName}${i}${dateName}.${ext}`;

                var oldPath = req.files.picture.path;

                fs.promises.copyFile(oldPath, newPath, 0, function (err) {
                  if (err) throw err;
                });

                const picture = `/upload/testimony/${today}/testimony${dateName}${i}${dateName}.${ext}`;

                await Testimony.findByIdAndUpdate(
                  dataId,
                  {
                    picture,
                    name: dataName,
                    position: dataPosition,
                    testimony: dataTestimony,
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
          if (dataPicture != null) {
            const today = new Date().toISOString().slice(0, 10);

            const folder = path.join(
              __dirname,
              "..",
              "upload",
              "testimony",
              today
            );

            await fs.promises.mkdir(folder, { recursive: true });

            const format = "YYYYMMDDHHmmss";

            const date = new Date();

            const dateName = moment(date).format(format);

            let ext;

            if (dataPicture.type == "image/png") {
              ext = "png";
            } else if (dataPicture.type == "image/jpg") {
              ext = "jpg";
            } else if (dataPicture.type == "image/jpeg") {
              ext = "jpeg";
            }

            const newPath =
              folder + `/testimony${dateName}${i}${dateName}.${ext}`;

            var oldPath = dataPicture.path;

            fs.promises.copyFile(oldPath, newPath, 0, function (err) {
              if (err) throw err;
            });

            const picture = `/upload/testimony/${today}/testimony${dateName}${i}${dateName}.${ext}`;

            const newData = await Testimony.create({
              picture,
              name: dataName,
              position: dataPosition,
              testimony: dataTestimony,
            });

            j = j + 1;

            registered.push(newData._id);
          } else {
            return response(400, {}, "Mohon upload gambar", res);
          }
        }
      }

      if (existing.length > 0 && registered.length > 0) {
        const tobeDeleted = await Testimony.find({
          _id: {
            $nin: registered,
          },
        });

        // console.log(tobeDeleted, registered);

        if (tobeDeleted.length > 0) {
          tobeDeleted.map(async (t) => {
            await Testimony.findByIdAndDelete(t._id);
          });
        }
      }

      const data = await Testimony.find();

      return response(200, data, "berhasil update struktur organisasi", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  deleteBanner: async (req, res) => {
    const { src } = req.query;
    if (!src || src === "") {
      return response(400, null, "Path src harus diisi!", res);
    }
    try {
      const findBanner = await Setting.find().select("banner");
      const banner = findBanner[0].banner;
      const filteredBanner = banner.filter((v) => v !== src);

      const updateBanner = await Setting.findOneAndUpdate(
        findBanner[0]._id,
        { $set: { banner: filteredBanner } },
        { new: true }
      );

      response(200, updateBanner, "Berhasil merubah banner", res);
    } catch (error) {
      console.log(error);
      response(500, error, error.message, res);
    }
  },
};
