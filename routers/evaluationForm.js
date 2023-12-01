const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/evaluationForm");

router.get("/", auth.user, Controller.index);
router.get("/check/:kelas", auth.user, Controller.check);
router.get("/result/instructor", auth.user, Controller.getResultByInstructor);
router.get(
  "/result/instructor/:kelas/:user",
  auth.user,
  Controller.getResultDetailByInstructor
);
router.get("/result/:kelas", auth.user, Controller.getResult);
router.get(
  "/result-detail/:kelas/:user",
  auth.user,
  Controller.getResultDetail
);

module.exports = router;
