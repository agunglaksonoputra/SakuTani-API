const express = require("express");
const router = express.Router();

const userBalanceController = require("../controllers/user-balance.controller");

router.get("/", userBalanceController.getAllLogs);
router.get("/:id", userBalanceController.getLogById);
router.post("/", userBalanceController.createLog);
router.put("/:id", userBalanceController.updateLog);
router.delete("/:id", userBalanceController.delete);

module.exports = router;
