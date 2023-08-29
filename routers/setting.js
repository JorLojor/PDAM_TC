const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Controller = require("../controllers/setting");

router.get("/", Controller.index);
router.get("/organization-structure", Controller.organizationStructureList);
router.post("/", auth.user, auth.admin, Controller.update);
router.post(
  "/organization-structure",
  auth.user,
  auth.admin,
  Controller.storeOrganizationStructure
);
router.put(
  "/organization-structure/:id",
  auth.user,
  auth.admin,
  Controller.updateOrganizationStructure
);
router.delete(
  "/organization-structure/:id",
  auth.user,
  auth.admin,
  Controller.deleteOrganizationStructure
);

module.exports = router;
