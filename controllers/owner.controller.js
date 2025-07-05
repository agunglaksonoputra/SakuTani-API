const ownerServices = require("../services/owner.service");

module.exports.getAll = async (req, res) => {
  try {
    const owners = await ownerServices.getAllOwners();
    res.json({ success: true, data: owners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const owner = await ownerServices.getOwnerById(req.params.id);
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });
    res.json({ success: true, data: owner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const newOwner = await ownerServices.createOwner(req.body);
    res.status(201).json({ success: true, data: newOwner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const updated = await ownerServices.updateOwner(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    await ownerServices.deleteOwner(req.params.id);
    res.json({ success: true, message: "Owner deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
