const KelasBesar = require("../models/kelasBesar");
const response = require("../respons/response");
const mongoose = require("mongoose");

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

            const data = await KelasBesar.create({
                title,
                picture,
                status,
            });

            return response(200, data, "berhasil menambahkan kelas besar", res);
        } catch (error) {
            await session.abortTransaction();
            response(500, error, error.message, res);
        } finally {
            session.endSession();
        }
    }
}