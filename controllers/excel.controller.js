// controllers/salesImportController.js
const ExcelJS = require("exceljs");
const db = require("../models");
const SalesTransaction = db.SalesTransaction;
const ExpensesTransaction = db.ExpensesTransaction;
const Customer = db.MasterCustomer;
const Vegetable = db.MasterVegetable;
const Unit = db.MasterUnit;

const getCellValue = (cell) => (typeof cell === "object" && cell?.result !== undefined ? cell.result : cell);

exports.importSales = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan. Pastikan key upload adalah sesuai",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[2];

    const rows = [];

    for (let i = 5; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const values = row.values;

      const id = getCellValue(values[2]);
      const date = getCellValue(values[3]);
      const customerNameRaw = getCellValue(values[4]);
      const itemNameRaw = getCellValue(values[5]);
      const quantity = parseFloat(getCellValue(values[6])) || 0;
      const unitNameRaw = getCellValue(values[7]);
      const weightPerUnitGram = parseFloat(getCellValue(values[8])) || 0;
      const totalWeightKg = parseFloat(getCellValue(values[9])) || 0;
      const pricePerUnit = parseFloat(getCellValue(values[10])) || 0;
      const totalPrice = parseFloat(getCellValue(values[11])) || 0;
      const notes = getCellValue(values[12]);

      // Lewati jika data wajib kosong
      if (!date || !customerNameRaw || !itemNameRaw || !quantity || !unitNameRaw || !totalPrice) {
        continue;
      }

      if (isNaN(id)) continue; // skip jika ID tidak valid

      const existing = await SalesTransaction.findByPk(id);
      if (existing) {
        console.log(`Data dengan id ${id} sudah ada, dilewat.`);
        continue;
      }

      // Bersihkan nama vegetable
      const itemName = typeof itemNameRaw === "string" ? itemNameRaw.trim().toLowerCase() : String(itemNameRaw).toLowerCase();

      // Cari atau buat vegetable
      let vegetable = await Vegetable.findOne({ where: { name: itemName } });
      if (!vegetable) {
        vegetable = await Vegetable.create({ name: itemName });
      }

      // Bersihkan nama customer
      const customerName = typeof customerNameRaw === "string" ? customerNameRaw.trim() : String(customerNameRaw);

      // Cari atau buat customer
      let customer = await Customer.findOne({ where: { name: customerName } });
      if (!customer) {
        customer = await Customer.create({ name: customerName });
      }

      // Bersihkan nama unit
      const unitName = typeof unitNameRaw === "string" ? unitNameRaw.trim().toLowerCase() : String(unitNameRaw).toLowerCase();

      // Cari atau buat Unit
      let unit = await Unit.findOne({ where: { name: unitName } });
      if (!unit) {
        unit = await Unit.create({ name: unitName });
      }

      rows.push({
        date: new Date(date),
        customer_id: customer.id,
        vegetable_id: vegetable.id,
        quantity,
        unit_id: unit.id,
        weight_per_unit_gram: weightPerUnitGram || 0,
        total_weight_kg: totalWeightKg || 0,
        price_per_unit: pricePerUnit || 0,
        total_price: totalPrice,
        notes: notes || null,
      });
    }

    // Jika tidak ada data valid
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid data found to import.",
      });
    }

    // Simpan ke database
    await SalesTransaction.bulkCreate(rows);

    return res.json({
      success: true,
      message: `${rows.length} records have been successfully imported.`,
    });
  } catch (err) {
    console.error("Import failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to import data.",
      error: err.message,
    });
  }
};

exports.importExpenses = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan. Pastikan key upload adalah sesuai",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[3];

    const rows = [];

    for (let i = 5; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const values = row.values;

      const id = getCellValue(values[2]);
      const date = getCellValue(values[3]);
      const itemName = getCellValue(values[4]);
      const quantity = parseFloat(getCellValue(values[5])) || 0;
      const unitNameRaw = getCellValue(values[6]);
      const pricePerUnit = parseFloat(getCellValue(values[7])) || 0;
      const shippingCost = parseFloat(getCellValue(values[8])) || 0;
      const discount = parseFloat(getCellValue(values[9])) || 0;
      const totalPrice = parseFloat(getCellValue(values[10])) || 0;
      const notes = getCellValue(values[11]);

      // Lewati jika data wajib kosong
      if (!date || !itemName || !quantity || !unitNameRaw || !totalPrice) {
        continue;
      }

      if (isNaN(id)) continue; // skip jika ID tidak valid

      const existing = await ExpensesTransaction.findByPk(id);
      if (existing) {
        console.log(`Data dengan id ${id} sudah ada, dilewat.`);
        continue;
      }

      // Bersihkan nama unit
      const unitName = typeof unitNameRaw === "string" ? unitNameRaw.trim().toLowerCase() : String(unitNameRaw).toLowerCase();

      // Cari atau buat customer
      let unit = await Unit.findOne({ where: { name: unitName } });
      if (!unit) {
        unit = await Unit.create({ name: unitName });
      }

      rows.push({
        id,
        date: new Date(date),
        name: itemName,
        quantity,
        unit_id: unit.id,
        price_per_unit: pricePerUnit,
        shipping_cost: shippingCost,
        discount: discount,
        total_price: totalPrice,
        notes: notes || null,
      });
    }

    // Jika tidak ada data valid
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid data found to import.",
      });
    }

    // Simpan ke database
    await ExpensesTransaction.bulkCreate(rows);

    return res.json({
      success: true,
      message: `${rows.length} records have been successfully imported.`,
    });
  } catch (err) {
    console.error("Import failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to import data.",
      error: err.message,
    });
  }
};
