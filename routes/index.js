const express = require("express");
const router = express.Router();

// Import semua route modular
const excelRoute = require("./excel.routes");
const monthlyReportRoute = require("./monthly-report.routes");
const ownerRoute = require("./owner.routes");
const profitShareRoute = require("./profit-share.routes");
// const userRoute = require("./user.route");
// const ownerRoute = require("./owner.route");

// Daftarkan dengan prefix masing-masing
router.use("/excel", excelRoute);
router.use("/report", monthlyReportRoute);
router.use("/owner", ownerRoute);
router.use("/profit-share", profitShareRoute);
// router.use("/users", userRoute);
// router.use("/owners", ownerRoute);

// Endpoint dasar untuk test
router.get("/", (req, res) => {
  res.send("✅ API route active");
});

module.exports = router;
