const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/setting");

const path = require("path");
const multer = require("multer");
const formidable = require("express-formidable");

const today = new Date().toISOString().slice(0, 10);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "upload", "banners", today),

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.get("/", Controller.index);
router.get("/organization-structure", Controller.organizationStructureList);
router.get("/testimony", Controller.testimonyList);
router.post(
  "/",
  auth.user,
  auth.admin,
  upload.fields([
    {
      name: "banners",
      maxCount: 5,
    },
    {
      name: "testimoni",
    },
    {
      name: "about",
    },
  ]),
  Controller.update
);
router.post(
  "/organization-structure",
  auth.user,
  auth.admin,
  formidable({ multiples: true }),
  Controller.updateOrganizationStructure
);
router.post(
  "/testimony",
  auth.user,
  auth.admin,
  formidable({ multiples: true }),
  Controller.updateTestimony
);

module.exports = router;
