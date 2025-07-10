const expensesTransactionService = require("../services/expenses-transaction.service");

module.exports = {
  async create(req, res) {
    try {
      const data = req.body;
      const transaction = await expensesTransactionService.create(data);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      console.error("Create Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const { page, limit, startDate, endDate } = req.query;
      const result = await expensesTransactionService.getAll({ page, limit, startDate, endDate });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("GetAll Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const id = req.params.id;
      const transaction = await expensesTransactionService.getById(id);
      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      console.error("GetById Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async update(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const transaction = await expensesTransactionService.update(id, data);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async softDelete(req, res) {
    try {
      const id = req.params.id;
      const result = await expensesTransactionService.softDelete(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("Delete Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
