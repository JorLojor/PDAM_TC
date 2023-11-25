const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/evaluationForm");

router.get("/", auth.user, Controller.index);
router.get("/result/:kelas", auth.user, Controller.getResult);
router.get(
  "/result-detail/:kelas/:user",
  auth.user,
  Controller.getResultDetail
);

module.exports = router;
