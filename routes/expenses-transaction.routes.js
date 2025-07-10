const express = require("express");
const expensesTransactioncontroller = require("../controllers/expenses-transaction.controller");
const router = express.Router();

router.get("/", expensesTransactioncontroller.getAll);
router.get("/:id", expensesTransactioncontroller.getById);
router.post("/", expensesTransactioncontroller.create);
router.put("/:id", expensesTransactioncontroller.update);
router.delete("/:id", expensesTransactioncontroller.softDelete);

module.exports = router;
