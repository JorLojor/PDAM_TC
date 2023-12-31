const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/evaluationFormQuestion");

router.get("/", auth.user, Controller.index);
router.get("/form/:evaluationForm", auth.user, Controller.getbyForm);
router.get("/:id", auth.user, Controller.show);
router.post("/", auth.user, Controller.store);
router.post("/answer", auth.user, auth.onlyStudent, Controller.answer);
// router.post(
//   "/generate-result",
//   auth.user,
//   auth.onlyStudent,
//   Controller.generateResult
// );
router.put("/:id", auth.user, Controller.update);
router.delete("/:id", auth.user, Controller.destroy);

module.exports = router;
