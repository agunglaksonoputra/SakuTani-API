const saleTransactionservice = require("../services/sales-transaction.service");

exports.create = async (req, res) => {
  try {
    const created_id = req.user.id;

    const data = await saleTransactionservice.findOrCreateByName(req.body, created_id);
    res.status(201).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, startDate, endDate, customer, item_name, sort_by, sort_order } = req.query;
    const data = await saleTransactionservice.getAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      startDate,
      endDate,
      customer,
      item_name,
      sort_by: sort_by || "date",
      sort_order: sort_order || "desc",
    });
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await saleTransactionservice.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await saleTransactionservice.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.softDelete = async (req, res) => {
  try {
    const data = await saleTransactionservice.softDelete(req.params.id);
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
