const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/kelasBesar");

const formidable = require("express-formidable");

router.post("/", auth.user, formidable(), Controller.create);
router.get("/", auth.user, Controller.index);
router.get("/published", Controller.publishedKelasList);
router.put("/:id", auth.user, formidable(), Controller.update);
router.delete("/:id", auth.user, Controller.destroy);
router.get("/show/:id", Controller.show)
router.get("/kelas/detail/:id", Controller.getOneKelas)
router.get("/kelas", Controller.getKelas)

module.exports = router;
