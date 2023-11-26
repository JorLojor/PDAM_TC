const express = require("express");
const testRouter = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/test");

const path = require("path");
const multer = require("multer");
const formidable = require("express-formidable");

const today = new Date().toISOString().slice(0, 10);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "upload", "test-image", today),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

//user
testRouter.get("/answered", auth.user, Controller.getTestAnswer);
testRouter.get("/graphic", auth.user, Controller.getGraphic);
testRouter.get("/:id", auth.user, Controller.getTest);
testRouter.get("/class/:id", auth.user, Controller.getTestByClass);
testRouter.get("/quiz/:slug", auth.user, Controller.getQuiz);
testRouter.post("/answered", auth.user, Controller.getTestAnswerFiltered);
testRouter.post("/checkAnswer", auth.user, Controller.testCheck);
testRouter.post("/nilai/:id", auth.user, Controller.nilai);

//buat yang bisa post test
testRouter.post(
  "/store/:slug/:title",
  auth.user,
  upload.array("images"),
  Controller.store
);
testRouter.patch(
  "/update-quiz/:id",
  auth.user,
  upload.array("images"),
  Controller.updateQuiz
);
testRouter.patch(
  "/update/:id/",
  auth.user,
  auth.instruktur,
  upload.array("images"),
  Controller.updateTest
);
testRouter.put(
  "/update/answer/:id/",
  auth.user,
  auth.instruktur,
  formidable(),
  Controller.updateTestAnswer
);
testRouter.put(
  "/update/question/:id/",
  auth.user,
  auth.instruktur,
  formidable(),
  Controller.updateTestQuestion
);
testRouter.delete(
  "/delete/:id/:slug/:title",
  auth.user,
  auth.instruktur,
  Controller.deleteTest
);
testRouter.delete("/quiz/:id", auth.user, Controller.deleteQuiz);
testRouter.post("/submit", auth.user, Controller.answerTest);

module.exports = testRouter;
