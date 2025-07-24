const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/v2/report");

router.get("/", reportController.getAllReports);
router.get("/summary", reportController.getSummary);

module.exports = router;
