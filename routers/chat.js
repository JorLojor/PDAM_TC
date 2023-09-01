const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Controller = require("../controllers/chat");

router.delete("/notification", auth.user, Controller.deletenotification);
router.get("/notification", auth.user, Controller.notification);
router.get("/notification/read/:id", auth.user, Controller.readNotification);
router.get("/read/:id", auth.user, Controller.read);
router.get("/:id", auth.user, Controller.index);
router.post("/:id", auth.user, Controller.store);

module.exports = router;
