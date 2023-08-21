const express = require("express");
const testRouter = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/test");

//user
// testRouter.get("/", auth.user, Controller.getTest);

//buat yang bisa post test
// testRouter.get("/fu/:id", auth.user, auth.instruktur, Controller.followUp);
// testRouter.get("/room/:id", auth.user, auth.instruktur, Controller.getRoom);
testRouter.post("/store", auth.user, auth.instruktur, Controller.store);

module.exports = testRouter;