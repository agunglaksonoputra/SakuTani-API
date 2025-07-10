const express = require("express");
const router = express.Router();
const monthlyReportController = require("../controllers/monthly-report.controller");

router.get("/", monthlyReportController.getAllReports);
router.get("/current", monthlyReportController.getCurrentReport);
router.post("/generate", monthlyReportController.generateReport); // body: { "date": "2025-07" }
router.post("/generate-all", monthlyReportController.generateAllReports);
router.get("/:date", monthlyReportController.getReportByDate); // contoh: /2025-07
router.get("/:id/details", monthlyReportController.getMonthlyReportDetailsById);

module.exports = router;
