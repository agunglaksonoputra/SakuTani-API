const express = require("express");
const router = express.Router();
const userBalancecontroller = require("../controllers/user-balance.controller");

router.get("/", userBalancecontroller.getAll);
router.get("/:ownerId", userBalancecontroller.getByOwner);
router.post("/:ownerId/recalculate", userBalancecontroller.recalculate);
router.delete("/:ownerId", userBalancecontroller.delete);
router.post("/generate-all", userBalancecontroller.generateAll);

module.exports = router;
