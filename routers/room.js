const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/room");

router.get("/", auth.user, Controller.index);
router.post("/", auth.user, Controller.store);

module.exports = router;
