const withdrawLogService = require("../services/withdraw-log.service");

module.exports.create = async (req, res) => {
  try {
    const data = await withdrawLogService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.getAll = async (req, res) => {
  try {
    const data = await withdrawLogService.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const data = await withdrawLogService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const data = await withdrawLogService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const data = await withdrawLogService.delete(req.params.id);
    res.json({ success: true, message: "Withdraw log deleted", data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
