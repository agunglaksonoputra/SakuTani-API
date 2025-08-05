const dayjs = require("dayjs");
const { Op, literal } = require("sequelize");
const { MonthlyReport, ProfitShare, WithdrawLog, Owner } = require("../../models");

module.exports.getAllReports = async () => {
  const reports = await MonthlyReport.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    order: [["date", "ASC"]],
    raw: true,
  });

  const profitSharesRaw = await ProfitShare.findAll({
    attributes: { exclude: ["createdAt", "updatedAt", "created_by"] },
    include: [{ model: Owner, as: "owner", attributes: ["id", "name"] }],
    order: [["date", "ASC"]],
    raw: true,
  });

  const withdrawsRaw = await WithdrawLog.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [{ model: Owner, as: "owner", attributes: ["id", "name"] }],
    order: [["date", "ASC"]],
    raw: true,
  });

  const profitShares = profitSharesRaw.map((item) => ({
    id: item.id,
    date: item.date,
    amount: parseFloat(item.amount),
    name: item["owner.name"],
    owner_id: item.owner_id,
  }));

  const withdraws = withdrawsRaw.map((item) => ({
    id: item.id,
    date: item.date,
    amount: parseFloat(item.amount),
    name: item["owner.name"],
    owner_id: item.owner_id,
  }));

  const getMonthYear = (date) => dayjs(date).format("YYYY-MM");

  const groupedProfitShares = {};
  const groupedWithdraws = {};

  for (const item of profitShares) {
    const key = getMonthYear(item.date);
    if (!groupedProfitShares[key]) groupedProfitShares[key] = [];
    groupedProfitShares[key].push(item);
  }

  for (const item of withdraws) {
    const key = getMonthYear(item.date);
    if (!groupedWithdraws[key]) groupedWithdraws[key] = [];
    groupedWithdraws[key].push(item);
  }

  const ownerCumulativeBalances = {};

  const result = [];

  for (const report of reports) {
    const monthKey = getMonthYear(report.date);

    const monthlyProfitShares = groupedProfitShares[monthKey] || [];
    const monthlyWithdraws = groupedWithdraws[monthKey] || [];

    const monthlyOwnerBalances = {};

    for (const ps of monthlyProfitShares) {
      const id = ps.owner_id;

      if (!ownerCumulativeBalances[id]) {
        ownerCumulativeBalances[id] = 0;
      }
      if (!monthlyOwnerBalances[id]) {
        monthlyOwnerBalances[id] = {
          owner_id: id,
          name: ps.name,
          monthlyChange: 0,
        };
      }

      monthlyOwnerBalances[id].monthlyChange += ps.amount;
      ownerCumulativeBalances[id] += ps.amount;
    }

    for (const wd of monthlyWithdraws) {
      const id = wd.owner_id;

      if (!ownerCumulativeBalances[id]) {
        ownerCumulativeBalances[id] = 0;
      }
      if (!monthlyOwnerBalances[id]) {
        monthlyOwnerBalances[id] = {
          owner_id: id,
          name: wd.name,
          monthlyChange: 0,
        };
      }

      monthlyOwnerBalances[id].monthlyChange -= wd.amount;
      ownerCumulativeBalances[id] -= wd.amount;
    }

    const balanceArray = [];

    for (const ownerId in ownerCumulativeBalances) {
      const ownerIdInt = parseInt(ownerId);
      const ownerName = monthlyOwnerBalances[ownerId]?.name || profitShares.find((p) => p.owner_id === ownerIdInt)?.name || withdraws.find((w) => w.owner_id === ownerIdInt)?.name || "Unknown";

      const monthlyChange = monthlyOwnerBalances[ownerId]?.monthlyChange || 0;
      const cumulativeTotal = ownerCumulativeBalances[ownerId];

      balanceArray.push({
        owner_id: ownerIdInt,
        name: ownerName,
        balance: parseFloat(cumulativeTotal.toFixed(2)),
      });
    }

    balanceArray.sort((a, b) => a.owner_id - b.owner_id);

    const formattedProfitShares = monthlyProfitShares.map((ps) => ({
      ...ps,
      amount: ps.amount.toFixed(2),
    }));

    const formattedWithdraws = monthlyWithdraws.map((wd) => ({
      ...wd,
      amount: wd.amount.toFixed(2),
    }));

    result.push({
      ...report,
      profitshare: formattedProfitShares,
      withdraw: formattedWithdraws,
      balance: balanceArray,
    });
  }

  return result.reverse();
};

module.exports.summaryReport = async () => {
  const reports = await MonthlyReport.findAll({
    attributes: ["total_sales", "total_expenses", "date"],
    raw: true,
  });

  if (reports.length === 0) {
    return {
      message: "Tidak ada data report",
    };
  }

  const totalSales = reports.reduce((sum, report) => {
    return sum + parseFloat(report.total_sales || 0);
  }, 0);

  const totalExpenses = reports.reduce((sum, report) => {
    return sum + parseFloat(report.total_expenses || 0);
  }, 0);

  const totalProfit = totalSales - totalExpenses;
  const averageSales = totalSales / reports.length;

  // Cari pendapatan tertinggi dan terendah
  let highest = reports[0];
  let lowest = reports[0];

  for (const report of reports) {
    const sales = parseFloat(report.total_sales || 0);

    if (sales > parseFloat(highest.total_sales || 0)) {
      highest = report;
    }

    if (sales < parseFloat(lowest.total_sales || 0)) {
      lowest = report;
    }
  }

  return {
    total_sales: totalSales,
    total_expenses: totalExpenses,
    total_profit: totalProfit,
    average_sales: averageSales,
    highest_income: {
      amount: parseFloat(highest.total_sales),
      date: highest.date,
    },
    lowest_income: {
      amount: parseFloat(lowest.total_sales),
      date: lowest.date,
    },
  };
};
