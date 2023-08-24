const Kelas = require('../models/kelas')
const Absensi = require('../models/absensiPeserta')
const response = require("../respons/response");
const mongoose = require("mongoose");

module.exports = {
    store: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { user, kelas, absenName, time } = req.body
            const absenKelas = await Kelas.findOne({_id: kelas, 'absensi.name': absenName})
            let absenTime = absenKelas.absensi.time
            // Get the current date
            var currentDate = new Date();

            // Define your time strings in 24-hour format
            var timeString1 = absenTime.split('-')[0];
            var timeString2 = absenTime.split('-')[1];

            // Split the time strings into hours and minutes
            var [hours1, minutes1] = timeString1.split(":");
            var [hours2, minutes2] = timeString2.split(":");

            // Create Date objects for today with the given time strings
            var date1 = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours1, minutes1, 0);
            var date2 = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours2, minutes2, 0);

            // Compare Date objects
            if(currentDate >= date1 && currentDate <= date2) {
                let absen = new Absensi({
                    user, kelas, absenName, time
                })
                absen.save({session})
            }else{
                response(403, {}, 'Absen Tidak diakui', res);
            }
            
            session.commitTransaction()
            response(200, {}, 'Absensi berhasil dimasukan', res);
        } catch (error) {
            session.abortTransaction();
            response(500, error, error.message, res);
        } finally {
            session.endSession()
        }
    },
    getData: async (req, res) => {
        try {
            const { date, kelas } = req.params
            
            const findKelasBySlug = await Kelas.findOne({slug: kelas})

            const absenPeserta = await Absensi.find({ date: date, kelas: findKelasBySlug._id }).populate('user', 'name').populate('kelas', 'nama')
            response(200, absenPeserta, 'Absensi berhasil didapat', res);
        } catch (error) {
            response(500, error, error.message, res);
        }
    }
}