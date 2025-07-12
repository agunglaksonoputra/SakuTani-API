const express = require("express");
const expensesTransactioncontroller = require("../controllers/expenses-transaction.controller");
const authorize = require("../middlewares/authorize.middleware");
const router = express.Router();

router.get("/", expensesTransactioncontroller.getAll);
router.get("/:id", expensesTransactioncontroller.getById);
router.post("/", authorize(["admin", "operator"]), expensesTransactioncontroller.create);
router.put("/:id", authorize(["admin", "operator"]), expensesTransactioncontroller.update);
router.delete("/:id", authorize(["admin", "operator"]), expensesTransactioncontroller.softDelete);

module.exports = router;
