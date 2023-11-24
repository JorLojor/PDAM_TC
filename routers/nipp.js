const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/nipp");

const formidable = require("express-formidable");

router.get("/", auth.user, Controller.index);
router.get("/:id", auth.user, Controller.show);
router.post("/", auth.user, Controller.store);
router.post("/import", formidable(), auth.user, Controller.import);
router.put("/:id", auth.user, Controller.update);
router.delete("/:id", auth.user, Controller.destroy);

module.exports = router;
