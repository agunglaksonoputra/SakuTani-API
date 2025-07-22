const express = require("express");
const router = express.Router();
const withdrawLogcontroller = require("../controllers/withdraw-log.controller");
const authorize = require("../middlewares/authorize.middleware");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, withdrawLogcontroller.getAllWithoutDelete);
router.get("/all", auth, withdrawLogcontroller.getAllGroup);
router.get("/:id", auth, withdrawLogcontroller.getById);
router.post("/", auth, authorize(["admin", "operator"]), withdrawLogcontroller.create);
router.put("/:id", auth, authorize(["admin", "operator"]), withdrawLogcontroller.update);
router.delete("/:id", auth, authorize(["admin", "operator"]), withdrawLogcontroller.delete);

module.exports = router;
