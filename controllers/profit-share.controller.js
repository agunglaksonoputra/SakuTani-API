const profitShareService = require("../services/profit-share.service");

exports.getAll = async (req, res) => {
  try {
    const result = await profitShareService.getAll();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await profitShareService.getById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Data not found" });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await profitShareService.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await profitShareService.update(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await profitShareService.delete(req.params.id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateByMonth = async (req, res) => {
  try {
    const result = await profitShareService.generateByMonth(req.body.date);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateAllFromMonthlyReports = async (req, res) => {
  try {
    const result = await profitShareService.generateAllFromMonthlyReports();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
