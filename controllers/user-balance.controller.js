const userBalanceService = require("../services/user-balance.service");

module.exports.getAll = async (req, res) => {
  const balances = await userBalanceService.getAll();
  res.json({ success: true, data: balances });
};

module.exports.getByOwner = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const balance = await userBalanceService.getByOwner(ownerId);
    if (!balance) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, data: balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.recalculate = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const updated = await userBalanceService.recalculateBalance(ownerId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.delete = async (req, res) => {
  const { ownerId } = req.params;
  try {
    await userBalanceService.delete(ownerId);
    res.json({ message: "Balance deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.generateAll = async (req, res) => {
  try {
    const result = await userBalanceService.generateAll();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
