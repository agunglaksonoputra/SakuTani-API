const dayjs = require("dayjs");
const ExcelJS = require("exceljs");
const db = require("../models");
const monthlyReportService = require("../services/monthly-report.service");

const SalesTransaction = db.SalesTransaction;
const ExpensesTransaction = db.ExpensesTransaction;
const MonthlyReport = db.MonthlyReport;
const ProfitShare = db.ProfitShare;
const Customer = db.MasterCustomer;
const Vegetable = db.MasterVegetable;
const Unit = db.MasterUnit;
const WithdrawLog = db.WithdrawLog;
const Owner = db.Owner;
const Role = db.Role;

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
    const updatedMonths = new Set();

    for (let i = 5; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const values = row.values;

      const id = getCellValue(values[2]);
      const dateRaw = getCellValue(values[3]);
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
      if (!dateRaw || !customerNameRaw || !itemNameRaw || !quantity || !unitNameRaw || !totalPrice) {
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

      const date = dayjs(dateRaw).format("YYYY-MM-DD");
      updatedMonths.add(dayjs(date).startOf("month").format("YYYY-MM-DD"));

      const userId = await Role.findOne({
        where: { name: req.user.role },
      });

      rows.push({
        date,
        customer_id: customer.id,
        vegetable_id: vegetable.id,
        quantity,
        unit_id: unit.id,
        weight_per_unit_gram: weightPerUnitGram || 0,
        total_weight_kg: totalWeightKg || 0,
        price_per_unit: pricePerUnit || 0,
        total_price: totalPrice,
        notes: notes || null,
        created_by: userId.id,
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

    for (const month of updatedMonths) {
      await monthlyReportService.updateMonthReport(month);
    }

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
    const updatedMonths = new Set();

    for (let i = 5; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const values = row.values;

      const id = getCellValue(values[2]);
      const dateRaw = getCellValue(values[3]);
      const itemName = getCellValue(values[4]);
      const quantity = parseFloat(getCellValue(values[5])) || 0;
      const unitNameRaw = getCellValue(values[6]);
      const pricePerUnit = parseFloat(getCellValue(values[7])) || 0;
      const shippingCost = parseFloat(getCellValue(values[8])) || 0;
      const discount = parseFloat(getCellValue(values[9])) || 0;
      const totalPrice = parseFloat(getCellValue(values[10])) || 0;
      const notes = getCellValue(values[11]);

      // Lewati jika data wajib kosong
      if (!dateRaw || !itemName || !quantity || !unitNameRaw || !totalPrice) {
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

      const date = dayjs(dateRaw).format("YYYY-MM-DD");
      updatedMonths.add(dayjs(date).startOf("month").format("YYYY-MM-DD"));

      const userId = await Role.findOne({
        where: { name: req.user.role },
      });

      rows.push({
        date,
        name: itemName,
        quantity,
        unit_id: unit.id,
        price_per_unit: pricePerUnit,
        shipping_cost: shippingCost,
        discount: discount,
        total_price: totalPrice,
        notes: notes || null,
        created_by: userId.id,
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

    for (const month of updatedMonths) {
      await monthlyReportService.updateMonthReport(month);
    }

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

exports.exportFullReport = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    /*** ===== Sheet 1: Penjualan ===== ***/
    const salesSheet = workbook.addWorksheet("Penjualan");

    // Create header row
    const headerRow1 = salesSheet.addRow(["No", "Tanggal", "Pelanggan", "Nama Sayur", "Jumlah", "Satuan", "Berat gr per satuan", "Jumlah kg", "Harga per Satuan", "Total Harga", "Keterangan"]);

    // Style header row
    headerRow1.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" }, // Light gray background
      };
    });

    // Set column widths
    salesSheet.getColumn("A").width = 5; // No
    salesSheet.getColumn("B").width = 15; // Tanggal
    salesSheet.getColumn("C").width = 20; // Pelanggan
    salesSheet.getColumn("D").width = 20; // Nama Sayur
    salesSheet.getColumn("E").width = 10; // Jumlah
    salesSheet.getColumn("F").width = 12; // Satuan
    salesSheet.getColumn("G").width = 18; // Berat gr per satuan
    salesSheet.getColumn("H").width = 12; // Jumlah kg
    salesSheet.getColumn("I").width = 15; // Harga per Satuan
    salesSheet.getColumn("J").width = 15; // Total Harga
    salesSheet.getColumn("K").width = 30; // Keterangan

    // Fetch sales data
    const sales = await SalesTransaction.findAll({
      include: [
        { model: Customer, as: "customer" },
        { model: Vegetable, as: "vegetable" },
        { model: Unit, as: "unit" },
      ],
      order: [["date", "ASC"]],
    });

    // Add data rows
    sales.forEach((item, index) => {
      const row = salesSheet.addRow([
        index + 1,
        dayjs(item.date).format("DD MMM YYYY"),
        item.customer?.name || "",
        item.vegetable?.name || "",
        parseFloat(item.quantity),
        item.unit?.name || "",
        parseFloat(item.weight_per_unit_gram),
        parseFloat(item.total_weight_kg),
        parseFloat(item.price_per_unit),
        parseFloat(item.total_price),
        item.notes || "",
      ]);

      // Add border to data rows
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Format numeric columns
      row.getCell(5).numFmt = "#,##0"; // Jumlah
      row.getCell(7).numFmt = "#,##0"; // Berat gr per satuan
      row.getCell(8).numFmt = "#,##0.00"; // Jumlah kg (2 decimal places)
      row.getCell(9).numFmt = "#,##0"; // Harga per Satuan
      row.getCell(10).numFmt = "#,##0"; // Total Harga

      // Alignment
      row.getCell(1).alignment = { horizontal: "center" }; // No
      row.getCell(2).alignment = { horizontal: "right" }; // Tanggal
      row.getCell(3).alignment = { horizontal: "left" }; // Pelanggan
      row.getCell(4).alignment = { horizontal: "left" }; // Nama Sayur
      row.getCell(5).alignment = { horizontal: "center" }; // Jumlah
      row.getCell(6).alignment = { horizontal: "center" }; // Satuan
      row.getCell(7).alignment = { horizontal: "right" }; // Berat gr per satuan
      row.getCell(8).alignment = { horizontal: "right" }; // Jumlah kg
      row.getCell(9).alignment = { horizontal: "right" }; // Harga per Satuan
      row.getCell(10).alignment = { horizontal: "right" }; // Total Harga
      row.getCell(11).alignment = { horizontal: "left" }; // Keterangan
    });

    // Add summary section
    if (sales.length > 0) {
      // Add empty row for spacing
      salesSheet.addRow([]);

      // Add summary header
      const summaryHeaderRow = salesSheet.addRow(["RINGKASAN PENJUALAN", "", "", "", "", "", "", "", "", "", ""]);

      // Style summary header
      summaryHeaderRow.getCell(1).font = { bold: true, size: 12 };
      summaryHeaderRow.getCell(1).alignment = { horizontal: "center" };

      summaryHeaderRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Merge cells for summary header
      salesSheet.mergeCells(`A${summaryHeaderRow.number}:K${summaryHeaderRow.number}`);

      // Add total row
      const totalRow = salesSheet.addRow([
        "Total Penjualan:",
        "",
        "",
        "",
        "",
        "",
        "",
        `=SUM(H2:H${sales.length + 1})`, // Total kg
        "",
        `=SUM(J2:J${sales.length + 1})`, // Total harga
        "",
      ]);

      // Style total row
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      salesSheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`);

      // Format and align totals
      totalRow.getCell(1).alignment = { horizontal: "right" };
      totalRow.getCell(8).alignment = { horizontal: "right" };
      totalRow.getCell(8).numFmt = "#,##0.00";
      totalRow.getCell(10).alignment = { horizontal: "right" };
      totalRow.getCell(10).numFmt = "#,##0";

      // Add count row
      const countRow = salesSheet.addRow(["Jumlah Transaksi:", "", sales.length, "", "", "", "", "", "", "", ""]);

      // Style count row
      countRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      countRow.getCell(1).alignment = { horizontal: "right" };
      countRow.getCell(3).alignment = { horizontal: "right" };

      salesSheet.mergeCells(`A${countRow.number}:B${countRow.number}`);
      salesSheet.mergeCells(`C${countRow.number}:J${countRow.number}`);
    }

    /*** ===== Sheet 2: Biaya ===== ***/
    const expenseSheet = workbook.addWorksheet("Biaya");

    // Create header row
    const headerRow = expenseSheet.addRow(["No", "Tanggal", "Nama", "Jumlah", "Satuan", "Harga", "Ongkir", "Diskon", "Total", "Keterangan"]);

    // Style header row
    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" }, // Light gray background
      };
    });

    // Set column widths
    expenseSheet.getColumn("A").width = 5; // No
    expenseSheet.getColumn("B").width = 15; // Tanggal
    expenseSheet.getColumn("C").width = 25; // Nama
    expenseSheet.getColumn("D").width = 10; // Jumlah
    expenseSheet.getColumn("E").width = 12; // Satuan
    expenseSheet.getColumn("F").width = 15; // Harga
    expenseSheet.getColumn("G").width = 12; // Ongkir
    expenseSheet.getColumn("H").width = 12; // Diskon
    expenseSheet.getColumn("I").width = 15; // Total
    expenseSheet.getColumn("J").width = 30; // Keterangan

    // Fetch expenses data
    const expenses = await ExpensesTransaction.findAll({
      include: [{ model: Unit, as: "unit" }],
      order: [["date", "ASC"]],
    });

    // Add data rows
    expenses.forEach((item, index) => {
      const row = expenseSheet.addRow([index + 1, dayjs(item.date).format("DD MMM YYYY"), item.name, parseFloat(item.quantity), item.unit?.name || "", parseFloat(item.price_per_unit), parseFloat(item.shipping_cost), parseFloat(item.discount), parseFloat(item.total_price), item.notes || ""]);

      // Add border to data rows
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Format numeric columns
      row.getCell(4).numFmt = "#,##0"; // Jumlah
      row.getCell(6).numFmt = "#,##0"; // Harga
      row.getCell(7).numFmt = "#,##0"; // Ongkir
      row.getCell(8).numFmt = "#,##0"; // Diskon
      row.getCell(9).numFmt = "#,##0"; // Total

      // Alignment
      row.getCell(1).alignment = { horizontal: "center" }; // No
      row.getCell(2).alignment = { horizontal: "right" }; // Tanggal
      row.getCell(4).alignment = { horizontal: "center" }; // Jumlah
      row.getCell(5).alignment = { horizontal: "center" }; // Satuan
      row.getCell(6).alignment = { horizontal: "right" }; // Harga
      row.getCell(7).alignment = { horizontal: "right" }; // Ongkir
      row.getCell(8).alignment = { horizontal: "right" }; // Diskon
      row.getCell(9).alignment = { horizontal: "right" }; // Total
      row.getCell(10).alignment = { horizontal: "left" }; // Keterangan
    });

    // Add total row if there are expenses
    if (expenses.length > 0) {
      expenseSheet.addRow([]);

      const totalRow = expenseSheet.addRow([
        "TOTAL",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `=SUM(I2:I${expenses.length + 1})`, // Formula untuk total
        "",
      ]);

      // Style total row
      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: "double" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Format and align total
      totalRow.getCell(1).alignment = { horizontal: "right" };
      totalRow.getCell(9).alignment = { horizontal: "right" };
      totalRow.getCell(9).numFmt = "#,##0";

      expenseSheet.mergeCells(`A${totalRow.number}:H${totalRow.number}`);
    }

    /*** ===== Sheet 3: Laporan Keuangan ===== ***/
    const financeSheet = workbook.addWorksheet("Laporan");

    // Set all cells first
    financeSheet.getCell("A1").value = "No";
    financeSheet.getCell("B1").value = "Bulan";
    financeSheet.getCell("C1").value = "Penjualan";
    financeSheet.getCell("D1").value = "Pengeluaran";
    financeSheet.getCell("E1").value = "Laba";

    // Set merged cells values
    financeSheet.getCell("F1").value = "Bagi Hasil";
    financeSheet.getCell("I1").value = "Pembayaran";
    financeSheet.getCell("L1").value = "Saldo";

    // Try different merge syntax
    try {
      // Merge horizontal (baris 1)
      financeSheet.mergeCells(1, 6, 1, 8); // F1:H1 (Bagi Hasil)
      financeSheet.mergeCells(1, 9, 1, 11); // I1:K1 (Pembayaran)
      financeSheet.mergeCells(1, 12, 1, 14); // L1:N1 (Saldo)

      // Merge vertical (kolom A-E dari baris 1 ke baris 2)
      financeSheet.mergeCells(1, 1, 2, 1); // A1:A2 (No)
      financeSheet.mergeCells(1, 2, 2, 2); // B1:B2 (Bulan)
      financeSheet.mergeCells(1, 3, 2, 3); // C1:C2 (Penjualan)
      financeSheet.mergeCells(1, 4, 2, 4); // D1:D2 (Pengeluaran)
      financeSheet.mergeCells(1, 5, 2, 5); // E1:E2 (Laba)
    } catch (error) {
      console.log("Merge error:", error);
    }

    // Set sub headers
    financeSheet.getCell("F2").value = "Zakat (10%)";
    financeSheet.getCell("G2").value = "Joko (45%)";
    financeSheet.getCell("H2").value = "Pardi (45%)";
    financeSheet.getCell("I2").value = "Zakat";
    financeSheet.getCell("J2").value = "Joko";
    financeSheet.getCell("K2").value = "Pardi";
    financeSheet.getCell("L2").value = "Zakat";
    financeSheet.getCell("M2").value = "Joko";
    financeSheet.getCell("N2").value = "Pardi";

    // Styling untuk header
    [1, 2].forEach((rowNum) => {
      financeSheet.getRow(rowNum).eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Tentukan warna berdasarkan kolom
        let fillColor = "FFD9D9D9"; // default abu-abu muda

        if (colNumber >= 9 && colNumber <= 11) {
          fillColor = "FFC6E0B4"; // hijau muda (ganti kode ini jika ingin warna lain)
        }

        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Set column widths
    financeSheet.getColumn("A").width = 5; // No
    financeSheet.getColumn("B").width = 12; // Bulan
    financeSheet.getColumn("C").width = 12; // Penjualan
    financeSheet.getColumn("D").width = 12; // Pengeluaran
    financeSheet.getColumn("E").width = 12; // Laba
    financeSheet.getColumn("F").width = 12; // Zakat (10%)
    financeSheet.getColumn("G").width = 12; // Joko (45%)
    financeSheet.getColumn("H").width = 12; // Pardi (45%)
    financeSheet.getColumn("I").width = 12; // Zakat
    financeSheet.getColumn("J").width = 12; // Joko
    financeSheet.getColumn("K").width = 12; // Pardi
    financeSheet.getColumn("L").width = 12; // Zakat
    financeSheet.getColumn("M").width = 12; // Joko
    financeSheet.getColumn("N").width = 12; // Pardi

    // Fetch data dari database
    const reports = await MonthlyReport.findAll({ order: [["date", "ASC"]] });

    let saldo = { zakat: 0, joko: 0, pardi: 0 };
    let no = 1;

    for (const report of reports) {
      const month = dayjs(report.date).format("MMM YYYY");

      const salesTotal = parseFloat(report.total_sales) || 0;
      const expensesTotal = parseFloat(report.total_expenses) || 0;
      const profit = parseFloat(report.total_profit) || 0;

      const laba = profit;
      const zakat = laba * 0.1;
      const joko = laba * 0.45;
      const pardi = laba * 0.45;

      const startOfMonth = dayjs(report.date).startOf("month").format("YYYY-MM-DD");
      const endOfMonth = dayjs(report.date).endOf("month").format("YYYY-MM-DD");

      const withdraws = await WithdrawLog.findAll({
        where: {
          date: {
            [db.Sequelize.Op.between]: [startOfMonth, endOfMonth],
          },
        },
        include: [{ model: Owner, as: "owner", attributes: ["name"] }],
      });

      let bayar = { zakat: 0, joko: 0, pardi: 0 };

      for (const w of withdraws) {
        const amount = parseFloat(w.amount);
        const name = w.owner?.name?.toLowerCase() ?? "";

        if (!isNaN(amount)) {
          if (name === "joko") bayar.joko += amount;
          else if (name === "pardi") bayar.pardi += amount;
          else if (name === "zakat") bayar.zakat += amount;
        }
      }

      saldo.zakat += zakat - bayar.zakat;
      saldo.joko += joko - bayar.joko;
      saldo.pardi += pardi - bayar.pardi;

      const normalizeSaldo = (value) => {
        return Math.abs(value) === 1 ? 0 : value;
      };

      // Add data row
      // const row = financeSheet.addRow([no++, month, salesTotal, expensesTotal, laba, zakat, joko, pardi, bayar.zakat, bayar.joko, bayar.pardi, normalizeSaldo(saldo.zakat), normalizeSaldo(saldo.joko), normalizeSaldo(saldo.pardi)]);
      const row = financeSheet.addRow([no++, month, salesTotal, expensesTotal, laba, zakat, joko, pardi, bayar.zakat, bayar.joko, bayar.pardi, saldo.zakat, saldo.joko, saldo.pardi]);

      // Format numeric columns as currency
      [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].forEach((colNum) => {
        row.getCell(colNum).numFmt = "#,##0";
      });

      // Add border to data rows
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Center align untuk kolom No dan Bulan
      row.getCell(1).alignment = { horizontal: "center" };

      // Right align untuk kolom angka
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].forEach((colNum) => {
        row.getCell(colNum).alignment = { horizontal: "right" };
      });
    }

    // Add total row if needed
    if (reports.length > 0) {
      financeSheet.addRow([]);

      const totalRow = financeSheet.addRow([
        "TOTAL",
        "",
        `=SUM(C3:C${reports.length + 2})`,
        `=SUM(D3:D${reports.length + 2})`,
        `=SUM(E3:E${reports.length + 2})`,
        `=SUM(F3:F${reports.length + 2})`,
        `=SUM(G3:G${reports.length + 2})`,
        `=SUM(H3:H${reports.length + 2})`,
        `=SUM(I3:I${reports.length + 2})`,
        `=SUM(J3:J${reports.length + 2})`,
        `=SUM(K3:K${reports.length + 2})`,
        "",
        "",
        "",
      ]);

      // Make total row bold
      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: "double" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      totalRow.getCell(1).alignment = { horizontal: "right" };
      financeSheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`);
    }

    // Auto-fit columns (optional)
    financeSheet.columns.forEach((column) => {
      if (column.width < 10) {
        column.width = 10;
      }
    });

    // Set headers
    const latestMonth = reports.length > 0 ? dayjs(reports[reports.length - 1].date).format("YYYY-MM") : dayjs().format("YYYY-MM");

    const fileName = `Laporan Bisnis Sayur ${latestMonth}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export failed:", err);
    res.status(500).json({ success: false, message: "Gagal mengekspor laporan", error: err.message });
  }
};
