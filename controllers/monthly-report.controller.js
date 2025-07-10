const monthlyReport = require("../services/monthly-report.service");
const userBalanceService = require("../services/user-balance.service");

module.exports.generateReport = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: "Date is required (e.g. 2025-07)" });
    }

    const report = await monthlyReport.generateMonthlyReport(date);
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
};

module.exports.getAllReports = async (req, res) => {
  try {
    const reports = await monthlyReport.getAllReports();
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
};

module.exports.getReportByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const report = await monthlyReport.getReportByDate(date);
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
};

module.exports.generateAllReports = async (req, res) => {
  try {
    const result = await monthlyReport.generateAllMonthlyReports();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
};

module.exports.getCurrentReport = async (req, res) => {
  try {
    const report = await monthlyReport.getOrGenerateCurrentMonthReport();
    const totalUserBalance = await userBalanceService.getTotalUserBalance();
    res.json({
      success: true,
      data: {
        ...report.toJSON(),
        total_user_balance: totalUserBalance,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.getMonthlyReportDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await monthlyReport.getMonthlyReportDetailsById(id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.status(200).json({ success: true, ...report });
  } catch (err) {
    res.status(500).json({ success: true, error: err.message });
  }
};
