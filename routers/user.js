const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/user");

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const today = new Date().toISOString().slice(0, 10);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "upload", "profile-image", today),
  filename: (req, file, cb) => {
    // const [name,type] = file.originalname.split('.')
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

//router.get('/all' ,userController.getAllUser);// note
router.get("/all", userController.getAllUser);
router.get("/certificate", auth.student, userController.getCertificate);
router.post("/my", userController.getSingleUser);
router.get(
  "/class-resolvement",
  auth.admin,
  userController.submitClassResolvementList
);
router.post(
  "/class-resolvement/deny",
  auth.admin,
  userController.denySubmitClassResolvement
);
router.post(
  "/class-resolvement/approve",
  auth.admin,
  userController.approveSubmitClassResolvement
);
router.post(
  "/class-resolvement",
  auth.student,
  userController.submitClassResolvement
);

router.get("/need-approval", auth.admin, userController.getStatusPendingUser); // get status pending userå
router.get("/role/:role", auth.admin, userController.getByRole); // get status pending userå
router.get(
  "/role-react-select/:role",
  auth.admin,
  userController.getByRoleReactSelect
); // get status pending userå
router.post("/filtered", auth.admin, userController.getWithFilter); // get with filter
router.get("/classes/:id", auth.student, userController.getUserClass); // get only user's class

router.post("/create", auth.admin, userController.createUser);
router.post("/email", userController.getbyEmail);
router.post(
  `/creation/${process.env.key_for_grant_access}`,
  userController.createUser
);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/status", auth.admin, userController.updateStatusUser);
router.put("/password/:id", auth.user, userController.updatePassword);
router.put(
  "/:id",
  auth.user,
  upload.single("userImage"),
  userController.updateUser
);
router.delete("/:id", auth.admin, userController.deleteUser);
router.put("/forgot/pass", userController.forgotPassword);
router.get("/reset-password/:code", userController.checkUserResetPassword);
router.put("/reset/:id/:code", userController.resetPassword);
router.get("/instruktur/:id", auth.user, userController.getInstructor); // get instructor
router.put("/instruktur/rating/:id", auth.user, userController.rate);
router.put("/forced/:id", auth.server, userController.forcedUpdate);

module.exports = router;
