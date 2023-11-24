const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/trainingMethod");

router.get("/", auth.user, Controller.index);
router.get("/:id", auth.user, Controller.show);
router.post("/", auth.user, Controller.store);
router.put("/:id", auth.user, Controller.update);
router.delete("/:id", auth.user, Controller.destroy);

module.exports = router;
