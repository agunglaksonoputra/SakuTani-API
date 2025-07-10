const dataMasterservice = require("../services/data-master.service");

exports.getAll = async (req, res) => {
  try {
    const data = await dataMasterservice.getAll();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: e.message });
  }
};
