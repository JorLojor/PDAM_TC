const express = require("express");
const testRouter = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/test");

const path = require('path')
const multer = require('multer')

const today = new Date().toISOString().slice(0,10)

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'upload', 'kelas-featured-image',today),
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage })

//user
// testRouter.get("/", auth.user, Controller.getTest);

//buat yang bisa post test
// testRouter.get("/fu/:id", auth.user, auth.instruktur, Controller.followUp);
// testRouter.get("/room/:id", auth.user, auth.instruktur, Controller.getRoom);
testRouter.post("/store", auth.user, auth.instruktur,upload.array('images'), Controller.store);

module.exports = testRouter;