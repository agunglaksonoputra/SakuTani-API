const dayjs = require("dayjs");
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment");
const { SalesTransaction, MasterCustomer, MasterVegetable, MasterUnit, User } = require("../models");
const monthlyReportService = require("./monthly-report.service");
const profitShareReport = require("./profit-share.service");

module.exports.create = async (data) => {
  return await SalesTransaction.create(data);
};

async function findOrCreateByName(Model, name) {
  const [record] = await Model.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return record;
}

module.exports.findOrCreateByName = async (data, created_by) => {
  const { date, customer, item_name, unit, quantity, weight_per_unit_gram, total_weight_kg, price_per_unit, total_price, notes } = data;

  const dateResult = date && date.trim() !== "" ? date : dayjs().format("YYYY-MM-DD");

  const normalizedVegetableName = item_name?.toLowerCase().trim();
  const normalizedUnitName = unit?.toLowerCase().trim();

  const customerRecord = await findOrCreateByName(MasterCustomer, customer);
  const vegetableRecord = await findOrCreateByName(MasterVegetable, normalizedVegetableName);
  const unitRecord = await findOrCreateByName(MasterUnit, normalizedUnitName);

  const transaction = await SalesTransaction.create({
    date: dateResult,
    customer_id: customerRecord.id,
    vegetable_id: vegetableRecord.id,
    unit_id: unitRecord.id,
    quantity,
    weight_per_unit_gram,
    total_weight_kg,
    price_per_unit,
    total_price,
    notes,
    created_by,
  });

  await monthlyReportService.updateMonthReport(transaction.date);

  return transaction;
};

module.exports.getAll = async ({ page = 1, limit = 10, startDate, endDate }) => {
  // Parsing dan validasi
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

  const { count, rows } = await SalesTransaction.findAndCountAll({
    where,
    offset,
    limit,
    order: [
      ["date", "DESC"],
      ["createdAt", "DESC"],
    ],
    include: [
      { model: MasterCustomer, as: "customer", attributes: ["name"] },
      { model: MasterVegetable, as: "vegetable", attributes: ["name"] },
      { model: MasterUnit, as: "unit", attributes: ["name"] },
      { model: User, as: "user", attributes: ["username"] },
    ],
  });

  // Mapping hasil agar name tampil langsung di level atas
  const sales = rows.map((tx) => ({
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
    created_by: tx.user?.username || null,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  }));

  const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");

  const totalCurrentMonth = await SalesTransaction.findOne({
    where: {
      deletedAt: null,
      date: { [Op.between]: [startOfMonth, endOfMonth] },
    },
    attributes: [
      [fn("SUM", col("total_price")), "totalPrice"],
      [fn("SUM", col("total_weight_kg")), "totalWeightKg"],
    ],
    raw: true,
  });

  return {
    page,
    limit,
    totalPrice: parseFloat(totalCurrentMonth.totalPrice || 0),
    totalWeightKg: parseFloat(totalCurrentMonth.totalWeightKg || 0),
    total: count,
    data: sales,
  };
};

module.exports.getById = async (id) => {
  return await SalesTransaction.findByPk(id);
};

module.exports.update = async (id, data) => {
  const transaction = await SalesTransaction.findByPk(id);
  if (!transaction) throw new Error("Transaction not found");
  await transaction.update(data);
  return transaction;
};

module.exports.softDelete = async (id) => {
  const transaction = await SalesTransaction.findByPk(id);
  if (!transaction) {
    throw new Error("Sales transaction not found");
  }

  await transaction.destroy();

  await monthlyReportService.updateMonthReport(transaction.date);

  return { success: true, message: "Sales transaction deleted and monthly report updated" };
};
