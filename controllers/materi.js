const mongoose = require("mongoose");
const MateriModel = require("../models/materi");
const TestModel = require("../models/test");
const TugasModel = require("../models/tugas");
const KelasModel = require("../models/kelas");
const User = require("../models/user");
const uploadFile = require("../middleware/filepath");
const multer = require("multer");
const response = require("../respons/response");
const _ = require("lodash");
const Test = require("../models/test");
const fs = require("fs");
const path = require("path");

module.exports = {
  getAllMateri: async (req, res) => {
    try {
      let { page, limits, section, instruktur, start, end } = req.query;

      let ids = [];
      let len = 0;
      let where = {};
      let startDate = new Date(start);
      let endDate = new Date(end);

      const materi = await MateriModel.find();

      if (section) {
        // len = section.length;

        // materi.map((u) => {
        //   if (u.section.substring(0, len) == section) {
        //     ids.push(u._id);
        //   }
        // });
        where.section = { $regex: `^${section}`, $options: "i" };
      }
      if (
        start != "" &&
        start != "undefined" &&
        end != "" &&
        end != "undefined"
      ) {
        where.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      let data = await MateriModel.find()
        .populate("instruktur items.tugas items.quiz")
        .sort({ createdAt: -1 });

      if (instruktur) {
        where.instruktur = { $in: instruktur };
      }

      // if (ids.length > 0) {
      //   data = await MateriModel.find({
      //     _id: { $in: ids },
      //   })
      //     .populate("instruktur items.tugas items.quiz")
      //     .sort({ createdAt: -1 });
      // }

      if (page > 0) {
        page = parseInt(page) || 1;
        limits = parseInt(limits) || 6;

        data = await MateriModel.find(where)
          .populate("instruktur items.tugas items.quiz")
          .skip((page - 1) * limits)
          .limit(limits)
          .sort({ createdAt: -1 });

        if (ids.length > 0) {
          data = await MateriModel.find({
            _id: { $in: ids },
          })
            .populate("instruktur items.tugas items.quiz")
            .skip((page - 1) * limits)
            .limit(limits)
            .sort({ createdAt: -1 });
        }
      }

      // if (instruktur) {
      //   let ids = [];

      //   data.map((u) => {
      //     u.instruktur.map((i) => {
      //       if (i._id == instruktur) {
      //         ids.push(u._id);
      //       }
      //     });
      //   });

      //   if (ids.length > 0) {
      //     if (page > 0) {
      //       data = await MateriModel.find({
      //         _id: { $in: ids },
      //       })
      //         .populate("instruktur items.tugas items.quiz")
      //         .skip((page - 1) * limits)
      //         .limit(limits)
      //         .sort({ createdAt: -1 });
      //     } else {
      //       data = await MateriModel.find({
      //         _id: { $in: ids },
      //       })
      //         .populate("instruktur items.tugas items.quiz")
      //         .sort({ createdAt: -1 });
      //     }
      //   }
      // }
      let total_data =
        (section != undefined && section != "" && section != null) ||
        (instruktur != undefined && instruktur != "" && instruktur != null) ||
        (start != "" && start != "undefined") ||
        (end != "" && end != "undefined")
          ? data.length
          : materi.length;
      result = {
        data: data,
        "total data": total_data,
      };

      response(200, result, "Get all materi", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getFiltered: async (req, res) => {
    try {
      let { page, limits, isPaginate } = req.query;
      const totalData = await MateriModel.find({
        ...req.body,
      }).countDocuments();

      if (isPaginate === 0) {
        const data = await MateriModel.find({
          ...req.body,
        }).populate("instruktur items.tugas");

        result = {
          data: data,
          "total data": totalData,
        };

        response(200, results, "get materi");
        return;
      }

      page = parseInt(page) || 1;
      limits = parseInt(limits) || 6;

      const data = await MateriModel.find({
        ...req.body,
      })
        .populate("instruktur items.tugas")
        .skip((page - 1) * limits)
        .limit(limits);

      result = {
        data: data,
        "total data": totalData,
      };

      response(200, result, "Get all materi", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getOneMateri: async (req, res) => {
    try {
      const _id = req.params.id;
      const result = await MateriModel.findById(_id);

      if (!result) {
        response(404, _id, "Materi tidak di temukan", res);
      }

      response(200, result, "Materi di dapat", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  getBySlugMateri: async (req, res) => {
    const { slug } = req.params;

    try {
      const result = await MateriModel.findOne({ slug: slug }).populate(
        "instruktur items.tugas"
      );

      if (!result) {
        response(404, result, "Materi tidak di temukan", res);
      }

      response(200, result, "Materi di dapat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getByGuruMateri: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await MateriModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });

      if (!result) {
        response(404, result, "Materi tidak di temukan", res);
      }

      response(200, result, "Materi di dapat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  createMateri: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { data } = req.body;

      let tugasList = [];
      let materi = [];

      JSON.parse(data).map((value, index) => {
        const { kodeMateri, section, description, items, instruktur } = value;
        if((instruktur == undefined || instruktur == null || instruktur == 'null') || (section == undefined || section == null || section == 'null') || (description == undefined || description == null || description == 'null')){
            return response(400, [], "Gagal dalam membuat materi!", res);
        }
        const randomNumber = Math.floor(Math.random() * 12948192821);
        const slug = _.kebabCase(section) + randomNumber;
        let itemsList = [];

        items.map((item, idx) => {
          let attachmentFiles = [];
          const { title, description, attachment, tugas } = item;

          if (req.files) {
            req.files.map((file) => {
              const [context, related, parentCode] =
                file.originalname.split("---");
              if (
                context === "Materi" &&
                title === related &&
                parentCode.split(".")[0] === kodeMateri
              ) {
                const filterPath = file.path.replaceAll("\\", "/");
                const pathlama = filterPath.split("/upload/");
                const cleanedAttachmentPath = pathlama[1].replace(/\s/g, "");
                attachmentFiles.push(cleanedAttachmentPath);
              }
            });
          }

          const newTugas = tugas.map((v, i) => {
            return {
              ...v,
              parent: {
                materi: title,
                section: section + " - " + kodeMateri,
              },
            };
          });

          tugasList.push(newTugas);

          itemsList.push({
            title: title,
            description: description,
            attachment: attachmentFiles,
            tugas: [],
          });
        });

        materi.push({
          kodeMateri: kodeMateri,
          section: section,
          description: description,
          slug: slug,
          items: itemsList,
          instruktur: instruktur,
          test: {},
        });
      });

      const saveMateri = await MateriModel.insertMany(materi, { session });

      let tugasPopulate = [];

      if (tugasList.length > 0) {
        let idx = 0;
        for (const tugas of tugasList.filter((v) => v.length > 0)) {
          const [name, kode] = tugas[0].parent.section.split(" - ");
          const title = tugas[0].parent.materi;

          const checkParent = saveMateri.filter(
            (v) => v.section === name && v.kodeMateri === kode
          );
          if (checkParent.length === 0) {
            response(404, [], "Gagal dalam membuat tugas!", res);
            return;
          }

          let tugasAttachment = "";

          if (req.files) {
            req.files.map((file) => {
              const [context, related, parentCode] =
                file.originalname.split(" --- ");
              if (
                context === "Tugas" &&
                tugas[0].title === related &&
                parentCode.split(".")[0] === kode
              ) {
                console.log(kode);
                const [base, attachmentPath] = file.path.split("/PDAM_TC/");
                tugasAttachment = attachmentPath;
              }
            });
          }

          const entityTugas = new TugasModel({
            materi: checkParent._id,
            kelas: tugas[0].kelas,
            title: tugas[0].title,
            instruction: tugas[0].instruction,
            deadline: tugas[0].deadline,
            attachment: tugasAttachment,
          });

          const savedTugas = await entityTugas.save({ session });

          const getPrimaryMateri = checkParent[0];

          const getItemsMateri = getPrimaryMateri.items.filter(
            (v) => v.title === title
          );

          tugasPopulate = [...tugasPopulate, savedTugas._id];

          const newItemsMateri = getItemsMateri.map((val, idx) => {
            return {
              title: val.title,
              description: val.description,
              attachment: val.attachment,
              tugas: tugasPopulate,
            };
          });

          // const mergeItems = [...getPrimaryMateri.items,...newItemsMateri]

          await MateriModel.updateOne(
            { _id: getPrimaryMateri._id },
            { $set: { items: newItemsMateri } },
            { session }
          );
          idx += 1;
        }
      }
      await session.commitTransaction();
      session.endSession();

      response(201, materi, "Berhasil menambahkan materi!", res);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      response(500, error, error.message, res);
    }
  },

  deleteAttachment: async (req, res) => {
    try {
      const { id } = req.params;
      const { attach } = req.body;
      const itemId = new mongoose.Types.ObjectId(id);
      const filePath = "upload/" + attach;

      const absoluteFilePath = path.resolve(filePath);

      fs.access(absoluteFilePath, fs.constants.F_OK, (err) => {
        if (err) {
          if (err.code === "ENOENT") {
            return response(200, {}, "tidak ada file", res);
          } else {
            console.error("Error accessing file:", err);
            return response(500, {}, "Internal Server Error", res);
          }
        } else {
          fs.unlink(absoluteFilePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
              return response(500, {}, "Internal Server Error", res);
            } else {
              MateriModel.findOneAndUpdate(
                { "items._id": itemId },
                { $pull: { "items.$[item].attachment": attach } },
                { arrayFilters: [{ "item._id": itemId }] }
              )
                .then(() => {
                  return response(200, {}, "Materi berhasil diubah", res);
                })
                .catch((err) => {
                  console.error("Error updating MateriModel:", err);
                  return response(500, {}, "Internal Server Error", res);
                });
            }
          });
        }
      });
    } catch (error) {
      console.error("Error:", error);
      return response(500, {}, "Internal Server Error", res);
    }
  },

  updateMateri: async (req, res) => {
    const idMaterial = req.params.id;
    const { data } = req.body;

    let extractedData = JSON.parse(data);
    const { items } = extractedData;

    try {
      const checkMateri = await MateriModel.findById(idMaterial);

      if (!checkMateri) {
        return response(404, null, "Materi tidak ditemukan!", res);
      }

      const newItems = items.map((val, idx) => {
        let attachmentFiles = [...checkMateri.items[idx].attachment];
        val.attachment.forEach((v, i) => {
          if (
            typeof v === "object" &&
            v.originName != null &&
            v.originName !== undefined
          ) {
            const file = req.files.find((f) => f.originalname === v.originName);
            const filterPath = file.path.replaceAll("\\", "/");
            const pathlama = filterPath.split("/upload/");
            const cleanedAttachmentPath = pathlama[1].replace(/\s/g, "");
            attachmentFiles.push(cleanedAttachmentPath);
            // console.log('yikes', v.originName)
          }
        });
        // if (req.files) {
        //   req.files.map((file) => {
        //     const [context, related, parentCode] = file.filename.split("---");
        //     if (val.attachment.index === idx) {
        //       const [base, attachmentPath] = file.path.split("/upload/");
        //       const cleanedAttachmentPath = attachmentPath.replace(/\s/g, "");
        //       attachmentFiles.push("/upload/" + cleanedAttachmentPath);
        //     }
        //   });
        // }
        return {
          ...val,
          attachment:
            attachmentFiles.length === 0
              ? checkMateri.items[idx].attachment
              : attachmentFiles,
        };
      });

      extractedData.items = newItems;

      const materi = await MateriModel.findByIdAndUpdate(
        idMaterial,
        {
          $set: {
            section: extractedData.section ?? checkMateri.section,
            description: extractedData.description ?? checkMateri.description,
            items: extractedData.items ?? checkMateri.items,
            instruktur: extractedData.instruktur ?? checkMateri.instruktur,
          },
        },
        {
          new: true,
        }
      );
      response(200, materi, "Materi berhasil diubah", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  deleteMateri: async (req, res) => {
    const idMaterial = req.params.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const materi = await MateriModel.findByIdAndRemove(idMaterial, {
        session,
      });
      const tugas = await TugasModel.deleteMany(
        { materi: idMaterial },
        { session }
      );

      const kelas = await KelasModel.updateMany(
        { materi: idMaterial },
        { $pull: { materi: idMaterial } },
        { session }
      );

      await session.commitTransaction();
      response(200, materi, "Materi deleted", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  getSubmateriByClass: async (req, res) => {
    try {
      const slug = req.params.slug;

      const kelas = await KelasModel.findOne({
        slug,
      });

      if (!kelas) {
        return response(400, {}, "Kelas tidak ditemukan", res);
      }

      let data = [];

      await Promise.all(
        kelas.materi.map(async (row) => {
          let submateri = await MateriModel.findById(row, {}).populate(
            "items.quiz items.tugas"
          );

          submateri = await User.populate(submateri, {
            path: "items.quiz.pembuat",
            select: "name",
          });

          data.push({
            submateri: submateri.items,
          });
        })
      );

      return response(200, data, "Submateri di dapat", res);
    } catch (error) {
      return response(500, error, "Server error", res);
    }
  },

  getSubmateri: async (req, res) => {
    try {
      const { slug } = req.params;
      const result = await MateriModel.findOne({ slug })
        .populate("items.tugas")
        .populate({
          path: "items.quiz",
          populate: {
            path: "pembuat",
            model: "User",
          },
        });
      console.log(result);

      if (!result) {
        response(404, _id, "Materi tidak di temukan", res);
      }

      response(200, result.items, "Materi di dapat", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  getAllMateriReactSelect: async (req, res) => {
    try {
      const result = await MateriModel.find()
        .select("section kodeMateri instruktur")
        .populate("instruktur");

      if (!result) {
        response(404, _id, "Materi tidak di temukan", res);
      }

      const mapped = result.map((v, i) => {
        return {
          value: v._id,
          label: v.section + " - " + `(${v.instruktur[0].name})`,
        };
      });

      response(200, mapped, "Materi di dapat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  copyTest: async (req, res) => {
    const from = req.query.from;
    const { id } = req.params;

    try {
      const checkMateri = await MateriModel.findOne({ _id: id });

      if (!checkMateri) {
        return response(404, null, "Tidak ada materi yang dimaksud", res);
      }

      if (from === "pre") {
        const findPostTest = await Test.findById(checkMateri.test.post).lean();

        if (!findPostTest) {
          return response(404, null, "Tidak ada test yang dimaksud", res);
        }

        const { type, _id, ...rest } = findPostTest;

        const createDuplicate = await Test.create({
          ...rest,
          type: "pre",
        });

        const newTest = {
          pre: createDuplicate._id,
          post: checkMateri.test.post,
        };

        const updateMateri = await MateriModel.findByIdAndUpdate(
          id,
          {
            $set: {
              test: newTest,
            },
          },
          { new: true }
        );

        return response(200, updateMateri, "Pre test berhasil disalin", res);
      }
      if (from === "post") {
        const findPreTest = await Test.findById(checkMateri.test.pre).lean();

        if (!findPreTest) {
          return response(404, null, "Tidak ada test yang dimaksud", res);
        }

        const { type, _id, ...rest } = findPreTest;

        const createDuplicate = await Test.create({
          ...rest,
          type: "post",
        });

        const newTest = {
          pre: checkMateri.test.pre,
          post: createDuplicate._id,
        };
        const updateMateri = await MateriModel.findByIdAndUpdate(
          id,
          {
            $set: {
              test: newTest,
            },
          },
          { new: true }
        );

        return response(200, updateMateri, "Post test berhasil disalin", res);
      }
    } catch (error) {
      response(500, error, error.message, res);
    }
  },

  getInstrukturThatHaveMateri: async (req, res) => {
    try {
      const materiList = await MateriModel.find({})
        .select("instruktur")
        .populate("instruktur", ["_id", "name"]);
      const listIntruktur = [];

      if (!materiList) {
        response(404, null, "Instruktur tidak di temukan", res);
      }

      for (let i = 0; i < materiList.length; i++) {
        listIntruktur.push({
          _id: materiList[i].instruktur[0]._id,
          name: materiList[i].instruktur[0].name,
        });
      }
      const filteredIns = listIntruktur.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t._id === item._id)
      );
      const mapped = filteredIns.map((v, i) => {
        return {
          value: v._id,
          label: `${v.name}`,
        };
      });

      response(200, mapped, "Instruktur di dapat", res);
    } catch (error) {
      response(500, error, error.message, res);
    }
  },
};
