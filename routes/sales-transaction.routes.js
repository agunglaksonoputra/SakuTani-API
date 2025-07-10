const express = require("express");
const salesTransactioncontroller = require("../controllers/sales-transaction.controller");
const router = express.Router();

router.get("/", salesTransactioncontroller.getAll);
router.get("/:id", salesTransactioncontroller.getById);
router.post("/", salesTransactioncontroller.create);
router.put("/:id", salesTransactioncontroller.update);
router.delete("/:id", salesTransactioncontroller.softDelete);

module.exports = router;
