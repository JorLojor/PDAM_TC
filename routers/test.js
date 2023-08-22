const express = require("express");
const testRouter = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/test");

const path = require('path')
const multer = require('multer')

const today = new Date().toISOString().slice(0,10)

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'upload', 'test-image',today),
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage })

//user
testRouter.get("/:id", auth.user, Controller.getTest);
testRouter.post("/nilai/:id", auth.user, Controller.nilai)

//buat yang bisa post test
testRouter.post("/store/:slug/:title", auth.user,upload.array('images'), Controller.store);
testRouter.patch("/update/:id/", auth.user, auth.instruktur,upload.array('images'), Controller.updateTest);
testRouter.delete("/delete/:id", auth.user, auth.instruktur, Controller.deleteTest);

module.exports = testRouter;