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

  if (!customer || customer.trim() === "") {
    throw new Error("Customer tidak boleh kosong");
  }

  if (!item_name || item_name.trim() === "") {
    throw new Error("Nama item tidak boleh kosong");
  }

  if (!unit || unit.trim() === "") {
    throw new Error("Satuan tidak boleh kosong");
  }

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

module.exports.getAll = async ({ page = 1, limit = 10, customer = "", startDate = "", endDate = "", sort_by = "date", sort_order = "desc" }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  const offset = (page - 1) * limit;

  // === Cari customerId dari nama ===
  let customerIdFilter = null;

  if (customer) {
    const foundCustomer = await MasterCustomer.findByPk(customer, {
      attributes: ["id"],
      raw: true,
    });

    customerIdFilter = foundCustomer ? foundCustomer.id : -1;
  }

  // === Cari vegetableId dari nama ===
  // let vegetableIdFilter = null;
  // if (item_name) {
  //   const foundVegetable = await MasterVegetable.findOne({
  //     where: { name: { [Op.iLike]: item_name } },
  //     attributes: ["id"],
  //     raw: true,
  //   });
  //   vegetableIdFilter = foundVegetable ? foundVegetable.id : -1;
  // }

  // === WHERE utama ===
  const where = {
    deletedAt: null,
    ...(customerIdFilter && { customer_id: customerIdFilter }),
    // ...(vegetableIdFilter && { vegetableId: vegetableIdFilter }),
  };

  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  } else if (endDate) {
    where.date = { [Op.lte]: endDate };
  }

  const include = [
    {
      model: MasterCustomer,
      as: "customer",
      attributes: ["name"],
    },
    {
      model: MasterVegetable,
      as: "vegetable",
      attributes: ["name"],
    },
    {
      model: MasterUnit,
      as: "unit",
      attributes: ["name"],
    },
    {
      model: User,
      as: "user",
      attributes: ["username"],
    },
  ];

  const order = [
    [sort_by, sort_order.toUpperCase()],
    ["createdAt", "DESC"],
  ];

  const { count, rows } = await SalesTransaction.findAndCountAll({
    where,
    include,
    offset,
    limit,
    order,
  });

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
  }));

  const hasFilter = customer || startDate || endDate;

  // Konversi tanggal default jika tidak ada filter
  let startSummary, endSummary;

  if (!hasFilter) {
    // Tanpa filter: default bulan ini
    startSummary = moment().startOf("month").format("YYYY-MM-DD");
    endSummary = moment().endOf("month").format("YYYY-MM-DD");
  } else if (customer && !startDate && !endDate) {
    // Filter hanya customer: semua data customer (tanpa batas tanggal)
    startSummary = "2000-01-01"; // tanggal awal yang aman
    endSummary = moment().endOf("day").format("YYYY-MM-DD"); // sampai hari ini
  } else {
    // Jika startDate dan/atau endDate tersedia
    startSummary = startDate || "2000-01-01";
    endSummary = endDate || moment().endOf("day").format("YYYY-MM-DD");
  }

  const whereTotal = {
    deletedAt: null,
    date: { [Op.between]: [startSummary, endSummary] },
    // ...(hasFilter && {}),
    ...(customerIdFilter && { customer_id: customerIdFilter }),
    // ...(vegetableIdFilter && { vegetableId: vegetableIdFilter }),
  };

  const totalAll = await SalesTransaction.findOne({
    where: whereTotal,
    include: [
      { model: MasterCustomer, as: "customer", attributes: [] },
      { model: MasterVegetable, as: "vegetable", attributes: [] },
    ],
    attributes: [
      [fn("SUM", col("total_price")), "totalPrice"],
      [fn("SUM", col("total_weight_kg")), "totalWeightKg"],
      [fn("COUNT", col("SalesTransaction.id")), "transactionCount"],
      [fn("COUNT", literal("*")), "totalData"],
    ],
    raw: true,
  });

  const totalPrice = parseFloat(totalAll?.totalPrice || 0);
  const totalWeightKg = parseFloat(totalAll?.totalWeightKg || 0);
  const transactionCount = parseInt(totalAll?.transactionCount || 0);
  const totalDataSummary = parseInt(totalAll?.totalData || 0);

  return {
    page,
    limit,
    total: count,
    totalFilter: hasFilter ? count : transactionCount,
    totalPrice,
    totalWeightKg,
    avgPricePerTransaction: transactionCount ? totalPrice / transactionCount : 0,
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
  await monthlyReportService.updateMonthReport(transaction.date);
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
