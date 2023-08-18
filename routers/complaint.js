const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/complaint");

router.get("/", auth.user, auth.admin, Controller.index);
router.get("/fu/:id", auth.user, auth.admin, Controller.followUp);
router.get("/room/:id", auth.user, auth.admin, Controller.getRoom);
router.post("/", auth.user, auth.onlyStudent, Controller.store);

module.exports = router;
