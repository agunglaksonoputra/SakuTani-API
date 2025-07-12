const dayjs = require("dayjs");
const { Op, literal } = require("sequelize");
const { MonthlyReport, SalesTransaction, ExpensesTransaction, MasterCustomer, MasterVegetable, MasterUnit, Owner, User } = require("../models");
const ProfitShareService = require("./profit-share.service");
const UserBalanceService = require("./user-balance.service");

module.exports.generateMonthlyReport = async (date) => {
  const inputDate = dayjs(date);
  const startDate = inputDate.startOf("month").toDate();
  const endDate = inputDate.endOf("month").toDate();
  const monthlyReportDate = inputDate.startOf("month").format("YYYY-MM-DD");

  const total_sales =
    (await SalesTransaction.sum("total_price", {
      where: {
        date: { [Op.between]: [startDate, endDate] },
        deletedAt: null,
      },
    })) || 0;

  const total_expenses =
    (await ExpensesTransaction.sum("total_price", {
      where: {
        date: { [Op.between]: [startDate, endDate] },
        deletedAt: null,
      },
    })) || 0;

  const total_profit = total_sales - total_expenses;

  const [report, created] = await MonthlyReport.findOrCreate({
    where: { date: monthlyReportDate },
    defaults: {
      total_sales,
      total_expenses,
      total_profit,
    },
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
  const inputDate = dayjs(date);
  const monthlyReportDate = inputDate.startOf("month").format("YYYY-MM-DD");

  const existingReport = await MonthlyReport.findOne({
    where: { date: monthlyReportDate },
  });

  const newReport = await module.exports.generateMonthlyReport(monthlyReportDate);

  if (existingReport) {
    await existingReport.update({
      ...newReport.dataValues,
    });
    return existingReport;
  }

  return newReport;
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

  const sortedMonths = Array.from(monthSet).sort();
  const result = [];

  for (const month of sortedMonths) {
    const report = await module.exports.generateMonthlyReport(`${month}-01`);
    result.push(report);
  }

  return result;
};

module.exports.getOrGenerateCurrentMonthReport = async () => {
  const monthlyReportDate = dayjs().startOf("month").format("YYYY-MM-DD");

  const existingReport = await MonthlyReport.findOne({
    where: { date: monthlyReportDate },
  });

  const newReport = await module.exports.generateMonthlyReport(monthlyReportDate);

  if (existingReport) {
    await existingReport.update({
      ...newReport.dataValues,
    });
    return existingReport;
  }

  return newReport;
};

module.exports.updateMonthReport = async (date) => {
  const inputDate = dayjs(date).startOf("month");
  const formattedMonth = inputDate.format("YYYY-MM-DD");

  console.log(`🔄 Mulai update report bulan: ${formattedMonth}`);

  const monthlyReport = await module.exports.generateMonthlyReport(formattedMonth);
  console.log("✅ Monthly Report diperbarui:", monthlyReport.dataValues);

  await ProfitShareService.generateByMonth(formattedMonth);
  console.log("✅ Profit Share diperbarui untuk bulan tersebut");

  const owners = await Owner.findAll({ where: { is_active: true } });

  for (const owner of owners) {
    await UserBalanceService.recalculateBalance(owner.id);
    console.log(`✅ User balance diperbarui untuk ${owner.name}`);
  }

  return {
    success: true,
    message: `Monthly report, profit share, dan user balance berhasil diperbarui untuk bulan ${formattedMonth}`,
  };
};

module.exports.getMonthlyReportDetailsById = async (id) => {
  // Ambil report berdasarkan ID
  const report = await MonthlyReport.findByPk(id);
  if (!report) {
    throw new Error("Monthly report not found");
  }

  const inputDate = dayjs(report.date);
  const startDate = inputDate.startOf("month").toDate();
  const endDate = inputDate.endOf("month").toDate();

  // Ambil transaksi penjualan dengan relasi
  const salesRaw = await SalesTransaction.findAll({
    where: {
      date: { [Op.between]: [startDate, endDate] },
      deletedAt: null,
    },
    include: [
      { model: MasterCustomer, as: "customer", attributes: ["name"] },
      { model: MasterVegetable, as: "vegetable", attributes: ["name"] },
      { model: MasterUnit, as: "unit", attributes: ["name"] },
      { model: User, as: "user", attributes: ["username"] },
    ],
    order: [["date", "DESC"]],
  });

  // Mapping hasil sales
  const sales = salesRaw.map((tx) => ({
    id: tx.id,
    date: tx.date,
    customer: tx.customer?.name || null,
    item_name: tx.vegetable?.name || null,
    unit: tx.unit?.name || null,
    quantity: tx.quantity,
    weight_per_unit_gram: tx.weight_per_unit_gram,
    total_weight_kg: tx.total_weight_kg,
    price_per_unit: tx.price_per_unit,
    total_price: tx.total_price,
    notes: tx.notes,
    created_by: tx.user.username,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  }));

  // Ambil semua transaksi pengeluaran
  const expensesRaw = await ExpensesTransaction.findAll({
    where: {
      date: { [Op.between]: [startDate, endDate] },
      deletedAt: null,
    },
    include: [
      { model: MasterUnit, as: "unit", attributes: ["name"] },
      { model: User, as: "user", attributes: ["username"] },
    ],
    order: [["date", "DESC"]],
  });

  const expenses = expensesRaw.map((tx) => ({
    id: tx.id,
    date: tx.date,
    name: tx.name,
    unit: tx.unit?.name || null,
    quantity: tx.quantity,
    price_per_unit: tx.price_per_unit,
    shipping_cost: tx.shipping_cost,
    discount: tx.discount,
    total_price: tx.total_price,
    notes: tx.notes,
    created_by: tx.user.username,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  }));

  return {
    // report,
    sales,
    expenses,
  };
};
