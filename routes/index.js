const express = require("express");
const router = express.Router();

// Import semua route modular
const authRoutes = require("./auth.routes");
const excelRoute = require("./excel.routes");
const monthlyReportRoute = require("./monthly-report.routes");
const ownerRoute = require("./owner.routes");
const profitShareRoute = require("./profit-share.routes");
const userBalanceRoute = require("./user-balance.routes");
const withdrawLogRoute = require("./withdraw-log.routes");
const transactionsRoutes = require("./transaction.routes");
// const userRoute = require("./user.route");
// const ownerRoute = require("./owner.route");

// Middleware Auth
const auth = require("../middlewares/auth.middleware");

// Daftarkan dengan prefix masing-masing
router.use("/auth", authRoutes);

router.use("/excel", auth, excelRoute);
router.use("/report", auth, monthlyReportRoute);
router.use("/owner", auth, ownerRoute);
router.use("/profit-share", auth, profitShareRoute);
router.use("/user-balance", auth, userBalanceRoute);
router.use("/withdraw-logs", auth, withdrawLogRoute);
router.use("/transactions", auth, transactionsRoutes);
// router.use("/users", userRoute);
// router.use("/owners", ownerRoute);

// Endpoint dasar untuk test
router.get("/", (req, res) => {
  res.send("✅ API route active");
});

module.exports = router;
