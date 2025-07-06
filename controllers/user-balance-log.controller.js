const userBalanceLogService = require("../services/user-balance-log.services");

module.exports.getAllLogs = async (req, res) => {
  try {
    const logs = await userBalanceLogService.getAll();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getLogById = async (req, res) => {
  try {
    const log = await userBalanceLogService.getById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.createLog = async (req, res) => {
  try {
    const newLog = await userBalanceLogService.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.updateLog = async (req, res) => {
  try {
    const updatedLog = await userBalanceLogService.update(req.params.id, req.body);
    res.json(updatedLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.deleteLog = async (req, res) => {
  try {
    const result = await userBalanceLogService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
