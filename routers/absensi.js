const express = require("express");
const absenRouter = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/absensi");

absenRouter.post('/store', auth.user, Controller.store)

module.exports = absenRouter;