const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload-excel.middleware");
const excelController = require("../controllers/excel.controller");

// router.get("/", (req, res) => {
//   res.send("✅ API route active");
// });
router.post("/import-sales", upload.single("SakuTani"), excelController.importSales);
router.post("/import-expenses", upload.single("SakuTani"), excelController.importExpenses);
router.get("/export", upload.single("SakuTani"), excelController.exportFullReport);

module.exports = router;
