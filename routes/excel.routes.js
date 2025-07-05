const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload_excel.middleware");
const excelController = require("../controllers/excel.controller");

// router.get("/", (req, res) => {
//   res.send("✅ API route active");
// });
router.post("/import-sales", upload.single("SakuTani"), excelController.importSales);
router.post("/import-expenses", upload.single("SakuTani"), excelController.importExpenses);

module.exports = router;
