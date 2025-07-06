const weeklySummaryService = require("../services/weekly-summary.service");

exports.getWeeklySummary = async (req, res) => {
  try {
    const data = await weeklySummaryService.getWeeklySummaries();
    res.status(200).json({
      success: true,
      message: "Weekly summary fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching weekly summary",
    });
  }
};
