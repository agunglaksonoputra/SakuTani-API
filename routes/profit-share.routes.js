const express = require("express");
const router = express.Router();
const profitSharecontroller = require("../controllers/profit-share.controller");

router.get("/", profitSharecontroller.getAll);
router.get("/:id", profitSharecontroller.getById);
router.post("/", profitSharecontroller.create);
router.put("/:id", profitSharecontroller.update);
router.delete("/:id", profitSharecontroller.delete);
router.post("/generate", profitSharecontroller.generateByMonth);
router.post("/generate/all", profitSharecontroller.generateAllFromMonthlyReports);

module.exports = router;
