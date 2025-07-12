const withdrawLogService = require("../services/withdraw-log.service");

module.exports.create = async (req, res) => {
  try {
    const log = await withdrawLogService.create(req.body, req.user.id);
    res.status(201).json({
      message: "Withdraw berhasil",
      data: log.get({ plain: true }), // ✅ hindari circular reference
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

module.exports.getAllWithoutDelete = async (req, res) => {
  try {
    const { page, limit, startDate, endDate } = req.query;
    const data = await withdrawLogService.getAllWithoutDelete({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      startDate,
      endDate,
    });
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
