const dayjs = require("dayjs");
const { ProfitShare, Owner, MonthlyReport, UserBalance, UserBalanceLog } = require("../models");

module.exports.getAll = async () => {
  await ProfitShare.findAll({ order: [["date", "DESC"]] });
};

module.exports.getById = async (id) => {
  await ProfitShare.findByPk(id);
};

module.exports.create = async (data) => {
  await ProfitShare.create(data);
};

module.exports.update = async (id, data) => {
  const profit = await ProfitShare.findByPk(id);
  if (!profit) throw new Error("Data not found");
  return await profit.update(data);
};

module.exports.delete = async (id) => {
  const profit = await ProfitShare.findByPk(id);
  if (!profit) throw new Error("Data not found");

  // Ambil log share_profit yang terkait
  const log = await UserBalanceLog.findOne({
    where: {
      reference_type: "share_profit",
      reference_id: profit.id,
    },
    order: [["createdAt", "DESC"]],
  });

  if (log) {
    const userBalance = await UserBalance.findOne({
      where: { owner_id: profit.owner_id },
    });

    if (userBalance) {
      const balanceBefore = parseFloat(userBalance.balance);
      const refundAmount = parseFloat(log.amount) * -1;
      const balanceAfter = balanceBefore + refundAmount;

      // Kembalikan saldo
      userBalance.balance = balanceAfter;
      await userBalance.save();

      // Tambah log pengembalian
      await UserBalanceLog.create({
        owner_id: profit.owner_id,
        reference_type: "refund_share_profit",
        reference_id: profit.id,
        amount: refundAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        date: log.date,
      });
    }

    // Hapus log share_profit sebelumnya
    await log.destroy();
  }

  // Terakhir: hapus ProfitShare
  await profit.destroy();
};

module.exports.generateByMonth = async (date) => {
  const formattedDate = dayjs(date).startOf("month").format("YYYY-MM-DD");

  const report = await MonthlyReport.findOne({ where: { date: formattedDate } });
  if (!report) throw new Error("Monthly report not found");

  const owners = await Owner.findAll({ where: { is_active: true } });
  const results = [];

  for (const owner of owners) {
    const shareAmount = (parseFloat(report.total_profit) * parseFloat(owner.share_percentage)) / 100;

    const [record, created] = await ProfitShare.findOrCreate({
      where: {
        owner_id: owner.id,
        date: formattedDate,
      },
      defaults: {
        amount: shareAmount,
      },
    });

    let previousAmount = 0;
    if (!created) {
      previousAmount = parseFloat(record.amount || 0);
      record.amount = shareAmount;
      await record.save();
    }

    const delta = shareAmount - previousAmount;
    if (delta === 0) {
      results.push(record);
      continue;
    }

    const [userBalance] = await UserBalance.findOrCreate({
      where: { owner_id: owner.id },
      defaults: { balance: 0 },
    });

    const balanceBefore = parseFloat(userBalance.balance);
    const balanceAfter = balanceBefore + delta;

    // Update user balance
    userBalance.balance = balanceAfter;
    await userBalance.save();

    // Cek apakah sudah ada log sebelumnya
    const existingLog = await UserBalanceLog.findOne({
      where: {
        reference_type: "share_profit",
        reference_id: record.id,
        owner_id: owner.id,
        date: formattedDate,
      },
    });

    if (existingLog) {
      // Jika delta negatif: refund karena profit turun
      await UserBalanceLog.create({
        owner_id: owner.id,
        reference_type: "refund_share_profit",
        reference_id: record.id,
        amount: delta, // akan bernilai negatif
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        date: formattedDate,
      });
    } else {
      // Jika pertama kali: log share_profit
      await UserBalanceLog.create({
        owner_id: owner.id,
        reference_type: "share_profit",
        reference_id: record.id,
        amount: delta,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        date: formattedDate,
      });
    }

    results.push(record);
  }

  return results;
};

module.exports.generateAllFromMonthlyReports = async () => {
  const reports = await MonthlyReport.findAll();
  const results = [];
  for (const report of reports) {
    const generated = await module.exports.generateByMonth(report.date);
    results.push(...generated);
  }
  return results;
};
