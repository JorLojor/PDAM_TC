const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/room");

router.get("/", auth.user, auth.admin, Controller.index);
router.post("/", auth.user, auth.onlyStudent, Controller.store);

module.exports = router;
