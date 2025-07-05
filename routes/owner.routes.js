const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/owner.controller");

router.get("/", ownerController.getAll);
router.post("/", ownerController.create);
router.get("/:id", ownerController.getById);
router.put("/:id", ownerController.update);
router.delete("/:id", ownerController.remove);

module.exports = router;
