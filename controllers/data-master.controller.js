const dataMasterservice = require("../services/data-master.service");

exports.getAll = async (req, res) => {
  try {
    const data = await dataMasterservice.getAll();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const data = await dataMasterservice.getCustomers();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getVegetables = async (req, res) => {
  try {
    const data = await dataMasterservice.getVegetables();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const data = await dataMasterservice.getUnits();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: e.message });
  }
};
