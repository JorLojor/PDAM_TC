const express = require("express");
const absenRouter = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/absensi");

absenRouter.get("/", auth.user, Controller.index);
absenRouter.post("/store", auth.user, Controller.store);
absenRouter.get("/get/:date/:kelas", auth.user, Controller.getData);
absenRouter.get(
  "/today/:kelas",
  auth.user,
  auth.admin,
  Controller.todayDataByClass
);

module.exports = absenRouter;
