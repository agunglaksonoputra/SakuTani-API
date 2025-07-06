const { Op } = require("sequelize");
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
  await profit.destroy();
};

module.exports.generateByMonth = async (date) => {
  const inputDate = new Date(date);
  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${year}-${month}-01`;

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

    if (!created) {
      record.amount = shareAmount;
      await record.save();
    }

    // Tambahkan ke saldo user
    const balance = await UserBalance.findOrCreate({
      where: { owner_id: owner.id },
      defaults: { balance: 0 },
    });
    const userBalance = Array.isArray(balance) ? balance[0] : balance;

    const balanceBefore = parseFloat(userBalance.balance);
    const balanceAfter = balanceBefore + shareAmount;

    userBalance.balance = balanceAfter;
    await userBalance.save();

    // Catat ke user balance log
    await UserBalanceLog.create({
      owner_id: owner.id,
      reference_type: "share_profit",
      reference_id: record.id,
      amount: shareAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      date: formattedDate,
    });

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
