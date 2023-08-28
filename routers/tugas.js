const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/tugas");

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const today = new Date().toISOString().slice(0, 10);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "upload", "tugas-file", today),
  filename: (req, file, cb) => {
    // const [name,type] = file.originalname.split('.')
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.get("/materi/:slug", auth.user, Controller.getTugas);
router.get("/check/:id/:idTugas", auth.user, Controller.checkPesertaStatus);
router.get("/:id", auth.user, Controller.getOnetugas);
router.get("/:id/tugas", Controller.getAllTugasInstruktur);

router.post(
  "/",
  auth.user,
  auth.instruktur,
  upload.single("attachment"),
  Controller.store
);

router.post("/filtered", Controller.getTugasFiltered);
router.put(
  "/:id",
  auth.instruktur,
  upload.single("attachment"),
  Controller.updateTugas
);
router.delete("/:id", auth.instruktur, Controller.deleteTugas);

router.put(
  "/pengumpulan/:id",
  auth.user,
  upload.single("answer-file"),
  Controller.pengumpulanTugas
);
router.put(
  "/updatePengumpulan/:id",
  auth.user,
  upload.single("answer-file"),
  Controller.updatePengumpulanTugas
);
router.put("/penilaian/:id", auth.instruktur, Controller.penilaian);

module.exports = router;
