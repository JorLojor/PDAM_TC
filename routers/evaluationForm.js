const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/evaluationForm");

router.get("/", auth.user, Controller.index);

module.exports = router;
