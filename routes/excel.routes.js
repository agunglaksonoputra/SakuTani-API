const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload-excel.middleware");
const excelController = require("../controllers/excel.controller");
const authorize = require("../middlewares/authorize.middleware");
const auth = require("../middlewares/auth.middleware");

// router.get("/", (req, res) => {
//   res.send("✅ API route active");
// });
router.post("/import-sales", auth, authorize(["admin", "operator"]), upload.single("SakuTani"), excelController.importSales);
router.post("/import-expenses", auth, authorize(["admin", "operator"]), upload.single("SakuTani"), excelController.importExpenses);
router.get("/export", auth, excelController.exportFullReport);

module.exports = router;
