const express = require("express");
const absenRouter = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/absensi");

absenRouter.post('/store', auth.user, Controller.store)
absenRouter.get('/get/:date/:kelas', auth.user, Controller.getData)

module.exports = absenRouter;