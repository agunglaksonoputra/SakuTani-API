const reportService = require("../../services/v2/report.service");

module.exports.getAllReports = async (req, res) => {
  try {
    const reports = await reportService.getAllReports();
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
};

module.exports.getSummary = async (req, res) => {
  try {
    const report = await reportService.summaryReport();
    res.json({ success: true, ...report });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
};
