const express = require("express");
const router = express.Router();

const crypto = require("crypto");

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const today = new Date().toISOString().slice(0, 10);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "upload", "materi-related", today),
  filename: (req, file, cb) => {
    // const [name,type] = file.originalname.split('.')
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const auth = require("../middleware/auth");
const Controller = require("../controllers/materi");

router.get("/", auth.user, Controller.getAllMateri);
router.get("/submateri/:slug", auth.user, Controller.getSubmateriByClass);
router.get("/:id", auth.user, Controller.getOneMateri);
router.get("/slug/:slug", auth.user, Controller.getBySlugMateri);
router.post("/", upload.array("attachments", 10), Controller.createMateri);
router.post(
  "/filtered",
  upload.array("attachments", 10),
  Controller.getFiltered
);
router.put(
  "/:id",
  auth.instruktur,
  upload.array("attachments", 10),
  Controller.updateMateri
);
router.delete("/:id", auth.instruktur, Controller.deleteMateri);
router.get("/:id", auth.instruktur, Controller.getByGuruMateri);
router.get("/sub/:slug", auth.user, Controller.getSubmateri);
router.get("/react/select", auth.user, Controller.getAllMateriReactSelect);
router.put("/copy-test/:id",auth.user,Controller.copyTest)


module.exports = router;
