const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/pengajuanKelas");

router.get("/", auth.admin, Controller.index);
router.get("/approve/:id", auth.admin, Controller.approve);
router.get("/reject/:id", auth.admin, Controller.reject);

module.exports = router;
