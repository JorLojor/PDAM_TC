const KelasBesar = require("../models/kelasBesar");
const response = require("../respons/response");
const mongoose = require("mongoose");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const KelasModel = require("../models/kelas");

module.exports = {
    index: async (req, res) => {
        try {
            let { page, limits, isPaginate } = req.query;

            const totalData = await KelasBesar.countDocuments();

            if (isPaginate === 0) {
                const data = await KelasBesar.find()
                    .sort({ createdAt: -1 });

                result = {
                    data: data,
                    "total data": totalData,
                };

                return response(200, results, "get kelas");
            }

            page = parseInt(page) || 1;
            limits = parseInt(limits) || 5;

            const data = await KelasBesar.find()
                .skip((page - 1) * limits)
                .limit(limits)
                .sort({ createdAt: -1 });

            result = {
                data: data,
                "total data": totalData,
            };

            return response(200, result, "berhasil get kelas", res);
        } catch (error) {
            return response(500, error, "Server error", res);
        }
    },
    create: async function (req, res) {
        const session = await mongoose.startSession()
        session.startTransaction();
        try {
            const title = req.fields[`title`];
            const status = req.fields[`status`];

            let picture = req.files[`picture`];
            let kelas = JSON.parse(req.fields[`kelas`]);

            if (!title) {
                return response(400, {}, "Mohon isi judul", res);
            } else if (!status) {
                return response(400, {}, "Mohon isi status", res);
            } else if (picture == null) {
                return response(400, {}, "Mohon upload gambar", res);
            }

            const today = new Date().toISOString().slice(0, 10);

            const folder = path.join(__dirname, "..", "upload", "kelas-besar", today);

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
            const newPath = folder + `/kelas-besar${dateName}${dateName}.${ext}`;

            var oldPath = picture.path;

            fs.promises.copyFile(oldPath, newPath, 0, function (err) {
                if (err) throw err;
            });

            picture = `/upload/kelas-besar/${today}/kelas-besar${dateName}${dateName}.${ext}`;

            const data = new KelasBesar({
                title,
                picture,
                status,
                kelas
            });
            await data.save({ session })
            await session.commitTransaction();

            return response(200, data, "berhasil menambahkan kelas besar", res);
        } catch (error) {
            await session.abortTransaction();
            response(500, error, error.message, res);
        } finally {
            session.endSession();
        }
    },
    update: async (req, res) => {
        try {
            const id = req.params.id;

            const title = req.fields[`title`];
            const status = req.fields[`status`];

            let picture = req.files[`picture`];
            let kelas = JSON.parse(req.fields[`kelas`]);
            const oldData = await KelasBesar.findOne({ _id: id });

            if (!title) {
                return response(400, {}, "Mohon isi judul", res);
            } else if (!status) {
                return response(400, {}, "Mohon isi status", res);
            }

            if (picture) {
                const today = new Date().toISOString().slice(0, 10);

                const folder = path.join(__dirname, "..", "upload", "kelas-besar", today);

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

                const newPath = folder + `/kelas-besar${dateName}${dateName}.${ext}`;

                var oldPath = picture.path;

                fs.promises.copyFile(oldPath, newPath, 0, function (err) {
                    if (err) throw err;
                });

                picture = `/upload/kelas-besar/${today}/kelas-besar${dateName}${dateName}.${ext}`;
            } else {
                picture = oldData.data;
            }

            let data = await KelasBesar.findByIdAndUpdate(
                id,
                {
                    title,
                    picture,
                    status,
                    kelas
                },
                {
                    new: true,
                }
            );

            return response(200, data, "berhasil menyunting kelas besar", res);
        } catch (error) {
            console.log(error);

            return response(500, error, "Server error", res);
        }
    },
    destroy: async (req, res) => {
        try {
            const id = req.params.id;
            const found = await KelasBesar.findById(id)
            const dirname = __dirname.replace("controllers", "");
            if (found.picture != null && found.picture != undefined) {
                fs.unlinkSync(path.join(dirname, found.picture), {
                    recursive: true,
                    force: true,
                });
            }
            const data = await KelasBesar.findOneAndRemove({ _id: id });

            return response(200, data, "berhasil hapus kelas unggulan", res);
        } catch (error) {
            return response(500, error, "Server error", res);
        }
    },
    publishedKelasList: async (req, res) => {
        try {
            let { page, limits, isPaginate } = req.query;

            const totalData = await KelasBesar.find({
                status: 1,
            }).countDocuments();

            if (isPaginate === 0) {
                const data = await KelasBesar.find({
                    status: 1,
                })
                    .sort({ createdAt: -1 })
                    .limit(4);

                result = {
                    data: data,
                    "total data": totalData,
                };

                return response(200, results, "get kelas unggulan");
            }

            page = parseInt(page) || 1;
            limits = parseInt(limits) || 4;

            const data = await KelasBesar.find({
                status: 1,
            })
                .skip((page - 1) * limits)
                .limit(limits)
                .sort({ createdAt: -1 });

            result = {
                data: data,
                "total data": totalData,
            };

            return response(200, data, "berhasil get kelas unggulan", res);
        } catch (error) {
            return response(500, error, "Server error", res);
        }
    },
    show: async (req, res) => {
        try {
            const id = req.params.id;

            const data = await KelasBesar.findById(id).populate('kelas', ['nama', 'slug', '_id', 'jadwal'])

            if (!data) {
                return response(400, {}, "Kelas Unggulan tidak ditemukan", res);
            }

            return response(200, data, "berhasil get kelas unggulan", res);
        } catch (error) {
            return response(500, error, "Server error", res);
        }
    },
    getKelas: async (req, res) => {
        try {
            const data = await KelasModel.find({ status: "published" }).select('_id nama')
            const selectAble = data.map(val => {
                return {
                    label: val.nama,
                    value: val._id
                }
            })

            return response(200, selectAble, "berhasil get kelas", res);
        } catch (error) {
            return response(500, error, "Server error", res);
        }
    },
    getOneKelas: async (req, res) => {
        const id = req.params.id;

        try {
            let kelas = await KelasModel.findById(id).populate(
                "materi materi.instruktur peserta kategori trainingMethod"
            );

            if (!kelas) {
                response(404, id, "Kelas tidak ditemukan", res);
            }

            response(200, kelas, "kelas ditemukan", res);
        } catch (error) {
            response(500, error, "Server error", res);
        }
    }
}