const express = require("express");
const router = express.Router();
const withdrawLogcontroller = require("../controllers/withdraw-log.controller");

router.get("/", withdrawLogcontroller.getAllWithoutDelete);
router.get("/:id", withdrawLogcontroller.getById);
router.post("/", withdrawLogcontroller.create);
router.put("/:id", withdrawLogcontroller.update);
router.delete("/:id", withdrawLogcontroller.delete);

module.exports = router;
