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

module.exports = {
  getAllMateri: async (req, res) => {
    try {
      let { page, limits, isPaginate } = req.query;
      const totalData = await MateriModel.countDocuments();

      if (isPaginate === 0) {
        const data = await MateriModel.find()
          .populate("instruktur items.tugas items.quiz")
          .sort({ createdAt: -1 });

        result = {
          data: data,
          "total data": totalData,
        };

        response(200, results, "get materi");
        return;
      }

      page = parseInt(page) || 1;
      limits = parseInt(limits) || 6;
      const data = await MateriModel.find()
        .populate("instruktur items.tugas items.quiz")
        .skip((page - 1) * limits)
        .limit(limits)
        .sort({ createdAt: -1 });

      result = {
        data: data,
        "total data": totalData,
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
        const randomNumber = Math.floor(Math.random() * 100);
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
                const [base, attachmentPath] = file.path.split("/upload/");
                const cleanedAttachmentPath = attachmentPath.replace(/\s/g, "");
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
        if (req.files) {
          req.files.map((file) => {
            const [context, related, parentCode] = file.filename.split("---");
            if (val.attachment.index === idx) {
              const [base, attachmentPath] = file.path.split("/upload/");
              const cleanedAttachmentPath = attachmentPath.replace(/\s/g, "");
              attachmentFiles.push("/upload/" + cleanedAttachmentPath);
            }
          });
        }
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
};
