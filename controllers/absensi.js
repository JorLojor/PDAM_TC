const Kelas = require('../models/kelas')
const Absensi = require('../models/absensiPeserta')
const response = require("../respons/response");
const mongoose = require("mongoose");

module.exports = {
    store: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { user, kelas, absenName, time} = req.body
            let absen = new Absensi({
                user, kelas, absenName, time
            })
            absen.save({session})
            session.commitTransaction()
            response(200, {}, 'Absensi berhasil dimasukan', res);
        } catch (error) {
            session.abortTransaction();
            response(500, error, error.message, res);
        } finally {
            session.endSession()
        }
    }
}

