const { Op, fn, col, literal } = require("sequelize");
const { MonthlyReport, SalesTransaction, ExpensesTransaction } = require("../models");

module.exports.generateMonthlyReport = async (date) => {
  const inputDate = new Date(date);
  const year = inputDate.getFullYear();
  const month = inputDate.getMonth() + 1; // bulan dimulai dari 0, jadi +1
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // hari terakhir bulan itu

  const sales = await SalesTransaction.sum("total_price", {
    where: { date: { [Op.between]: [startDate, endDate] } },
  });

  const expenses = await ExpensesTransaction.sum("total_price", {
    where: { date: { [Op.between]: [startDate, endDate] } },
  });

  const total_sales = sales || 0;
  const total_expenses = expenses || 0;
  const total_profit = total_sales - total_expenses;

  const formattedMonth = month.toString().padStart(2, "0");
  const monthlyReportDate = `${year}-${formattedMonth}-01`;

  const [report, created] = await MonthlyReport.findOrCreate({
    where: { date: monthlyReportDate },
    defaults: { total_sales, total_expenses, total_profit },
  });

  if (!created) {
    report.total_sales = total_sales;
    report.total_expenses = total_expenses;
    report.total_profit = total_profit;
    await report.save();
  }

  return report;
};

module.exports.getAllReports = async () => {
  return MonthlyReport.findAll({ order: [["date", "DESC"]] });
};

module.exports.getReportByMonth = async (date) => {
  const inputDate = new Date(date);
  const year = inputDate.getFullYear();
  const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
  const monthlyReportDate = `${year}-${month}-01`;

  return MonthlyReport.findOne({
    where: { date: monthlyReportDate },
  });
};

module.exports.generateAllMonthlyReports = async () => {
  const salesMonths = await SalesTransaction.findAll({
    attributes: [[literal(`TO_CHAR("date", 'YYYY-MM')`), "month"]],
    group: [literal(`TO_CHAR("date", 'YYYY-MM')`)],
    raw: true,
  });

  const expensesMonths = await ExpensesTransaction.findAll({
    attributes: [[literal(`TO_CHAR("date", 'YYYY-MM')`), "month"]],
    group: [literal(`TO_CHAR("date", 'YYYY-MM')`)],
    raw: true,
  });

  const monthSet = new Set([...salesMonths.map((row) => row.month), ...expensesMonths.map((row) => row.month)]);

  const sortedMonths = Array.from(monthSet).sort(); // ascending: "2024-01", "2024-02", ...

  const result = [];

  for (const month of sortedMonths) {
    const report = await module.exports.generateMonthlyReport(`${month}-01`);
    result.push(report);
  }

  return result;
};

module.exports.getOrGenerateCurrentMonthReport = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const monthlyReportDate = `${year}-${month}-01`;

  // Cek apakah laporan bulan ini sudah ada
  let report = await MonthlyReport.findOne({
    where: { date: monthlyReportDate },
  });

  // Jika belum ada, generate laporan
  if (!report) {
    report = await module.exports.generateMonthlyReport(monthlyReportDate);
  }

  return report;
};
