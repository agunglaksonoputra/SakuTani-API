const dayjs = require("dayjs");
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment");
const { ExpensesTransaction, MasterUnit, User } = require("../models");
const monthlyReportService = require("./monthly-report.service");
const profitShareReport = require("./profit-share.service");

async function findOrCreateUnitByName(name) {
  const normalizedName = name?.toLowerCase().trim();
  const [unit] = await MasterUnit.findOrCreate({
    where: { name: normalizedName },
    defaults: { name: normalizedName },
  });
  return unit;
}

module.exports.create = async (data, created_by) => {
  const { date, name, quantity, unit, price_per_unit, shipping_cost = 0, discount = 0, total_price, notes } = data;

  if (!unit || unit.trim() === "") {
    throw new Error("Satuan tidak boleh kosong");
  }

  const dateResult = date && date.trim() !== "" ? date : dayjs().format("YYYY-MM-DD");
  const unitRecord = await findOrCreateUnitByName(unit);

  const transaction = await ExpensesTransaction.create({
    date: dateResult,
    name,
    quantity,
    unit_id: unitRecord.id,
    price_per_unit,
    shipping_cost,
    discount,
    total_price,
    notes,
    created_by,
  });

  // Generate atau update laporan bulanan setelah transaksi dibuat
  const transactionDate = dayjs(transaction.date);
  const formattedMonth = transactionDate.startOf("month").format("YYYY-MM-DD");
  await monthlyReportService.updateMonthReport(formattedMonth);

  return transaction;
};

module.exports.getAll = async ({ page = 1, limit = 10, startDate, endDate, sort_order = "desc" }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const offset = (page - 1) * limit;
  const where = { deletedAt: null };

  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  } else if (endDate) {
    where.date = { [Op.lte]: endDate };
  }

  const { count, rows } = await ExpensesTransaction.findAndCountAll({
    where,
    offset,
    limit,
    order: [
      ["date", sort_order.toUpperCase()],
      ["createdAt", "DESC"],
    ],
    include: [
      { model: MasterUnit, as: "unit", attributes: ["name"] },
      {
        model: User,
        as: "user",
        attributes: ["username"],
      },
    ],
  });

  const expenses = rows.map((tx) => ({
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
    created_by: tx.user?.username || null,
  }));

  const hasFilter = startDate || endDate;

  let startSummary, endSummary;

  if (!hasFilter) {
    startSummary = moment().startOf("month").format("YYYY-MM-DD");
    endSummary = moment().endOf("month").format("YYYY-MM-DD");
  } else {
    startSummary = startDate || "2000-01-01";
    endSummary = endDate || moment().endOf("day").format("YYYY-MM-DD");
  }

  const totalAll = await ExpensesTransaction.findOne({
    where: {
      deletedAt: null,
      date: { [Op.between]: [startSummary, endSummary] },
    },
    attributes: [
      [fn("SUM", col("total_price")), "totalPrice"],
      [fn("COUNT", col("ExpensesTransaction.id")), "transactionCount"],
      // [fn("COUNT", literal("*")), "totalData"],
    ],
    raw: true,
  });

  const totalPrice = parseFloat(totalAll?.totalPrice || 0);
  const transactionCount = parseInt(totalAll?.transactionCount || 0);
  // const totalDataSummary = parseInt(totalAll?.totalData || 0);

  return {
    page,
    limit,
    total: count,
    totalFilter: hasFilter ? count : transactionCount,
    totalPrice,
    avgPricePerTransaction: transactionCount ? totalPrice / transactionCount : 0,
    data: expenses,
  };
};

module.exports.getById = async (id) => {
  return await ExpensesTransaction.findByPk(id, {
    include: [{ model: MasterUnit, as: "unit", attributes: ["name"] }],
  });
};

module.exports.update = async (id, data) => {
  const transaction = await ExpensesTransaction.findByPk(id);
  if (!transaction) throw new Error("Transaction not found");

  const { date, name, quantity, unit, price_per_unit, shipping_cost = 0, discount = 0, total_price, notes } = data;

  const parsedDate = dayjs(date).format("YYYY-MM-DD");
  const unitRecord = await findOrCreateUnitByName(unit);

  await transaction.update({
    date: parsedDate,
    name,
    quantity,
    unit_id: unitRecord.id,
    price_per_unit,
    shipping_cost,
    discount,
    total_price,
    notes,
  });

  await monthlyReportService.generateMonthlyReport(parsedDate);
  await profitShareReport.generateByMonth(parsedDate);

  return transaction;
};

module.exports.softDelete = async (id) => {
  const transaction = await ExpensesTransaction.findByPk(id);
  if (!transaction) throw new Error("Transaction not found");

  const transactionDate = dayjs(transaction.date);
  const formattedMonth = transactionDate.startOf("month").format("YYYY-MM-DD");

  await transaction.destroy();

  await monthlyReportService.updateMonthReport(formattedMonth);

  return {
    success: true,
    message: "Expenses transaction deleted and monthly report updated",
  };
};
