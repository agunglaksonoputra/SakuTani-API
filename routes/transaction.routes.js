const express = require("express");
const router = express.Router();
const weeklySummaryController = require("../controllers/weekly-summry.controller");

router.get("/weekly-summary", weeklySummaryController.getWeeklySummary);

module.exports = router;
