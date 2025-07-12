const express = require("express");
const salesTransactioncontroller = require("../controllers/sales-transaction.controller");
const authorize = require("../middlewares/authorize.middleware");
const router = express.Router();

router.get("/", salesTransactioncontroller.getAll);
router.get("/:id", salesTransactioncontroller.getById);
router.post("/", authorize(["admin", "operator"]), salesTransactioncontroller.create);
router.put("/:id", authorize(["admin", "operator"]), salesTransactioncontroller.update);
router.delete("/:id", authorize(["admin", "operator"]), salesTransactioncontroller.softDelete);

module.exports = router;
