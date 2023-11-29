const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/ranking");

//user
router.get("/:id", auth.user, Controller.index);

module.exports = router;
