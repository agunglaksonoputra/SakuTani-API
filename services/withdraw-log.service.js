const dayjs = require("dayjs");
const { Op, col, where } = require("sequelize");
const logger = require("../utils/logger");
const { WithdrawLog, UserBalance, UserBalanceLog, Owner, User } = require("../models");

module.exports.create = async (data, created_by) => {
  try {
    const { name, amount, date } = data;

    // Validasi owner
    const owner = await Owner.findOne({ where: { name } });
    if (!owner) throw new Error("Owner not found");

    // Validasi saldo
    const balance = await UserBalance.findOne({ where: { owner_id: owner.id } });
    if (!balance) throw new Error("User balance not found");

    const withdrawAmount = parseFloat(amount);
    const currentBalance = parseFloat(balance.balance);

    if (withdrawAmount > currentBalance) {
      throw new Error("Insufficient balance");
    }

    const dateResult = date && date.trim() !== "" ? date : dayjs().format("YYYY-MM-DD");

    // Validasi user ID (opsional, tapi aman)
    const user = await User.findByPk(created_by);
    if (!user) throw new Error("User (created_by) not found");

    // Simpan ke WithdrawLog
    const log = await WithdrawLog.create({
      owner_id: owner.id,
      amount: withdrawAmount,
      date: dateResult,
      created_by: created_by,
    });

    // Update saldo
    const newBalance = currentBalance - withdrawAmount;
    balance.balance = newBalance;
    await balance.save();

    // Simpan ke UserBalanceLog
    await UserBalanceLog.create({
      owner_id: owner.id,
      reference_type: "withdraw",
      reference_id: log.id,
      amount: -withdrawAmount,
      balance_before: currentBalance,
      balance_after: newBalance,
      date: dateResult,
      created_by: created_by,
    });

    logger.info(`Withdraw success: ${name} withdrew ${withdrawAmount}`);
    return log;
  } catch (err) {
    logger.error(`Withdraw create error: ${err.message}`);
    throw new Error("Withdraw process failed");
  }
};

module.exports.getAll = async () => {
  return await WithdrawLog.findAll();
};

module.exports.getAllWithoutDelete = async ({ page = 1, limit = 10, startDate, endDate }) => {
  page = parseInt(page);
  limit = parseInt(limit);

  const offset = (page - 1) * limit;
  const where = { deletedAt: null };

  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  } else if (endDate) {
    where.date = { [Op.lte]: endDate };
  }

  return await WithdrawLog.findAll({
    where,
    include: [
      {
        model: Owner,
        as: "owner",
        attributes: [],
      },
    ],
    attributes: ["id", [col("owner.name"), "name"], "amount", "date", "deletedAt", "createdAt"],
    order: [
      ["date", "DESC"],
      ["createdAt", "DESC"],
    ],
    limit,
    offset,
    raw: true,
  });
};

module.exports.getAllGroup = async ({ page = 1, limit = 10 }) => {
  page = parseInt(page);
  limit = parseInt(limit);

  const offset = (page - 1) * limit;

  const logs = await WithdrawLog.findAll({
    where: { deletedAt: null },
    include: [
      {
        model: Owner,
        as: "owner",
        attributes: [],
      },
    ],
    attributes: ["id", [col("owner.name"), "name"], "amount", "date", "deletedAt"],
    order: [
      ["date", "ASC"],
      ["createdAt", "ASC"],
    ],
    limit,
    offset,
    raw: true,
  });

  const grouped = {};

  logs.forEach((log) => {
    const month = dayjs(log.date).format("YYYY-MM");

    if (!grouped[month]) {
      grouped[month] = {
        totalAmount: 0,
        data: [],
      };
    }

    const formattedAmount = parseFloat(log.amount);

    grouped[month].totalAmount += formattedAmount;

    grouped[month].data.push({
      id: log.id,
      name: log.name,
      amount: formattedAmount.toFixed(2),
      date: dayjs(log.date).format("YYYY-MM-DD"),
    });
  });

  const result = Object.keys(grouped)
    .sort()
    .map((month) => ({
      month,
      totalAmount: grouped[month].totalAmount.toFixed(2),
      data: grouped[month].data,
    }));

  return {
    page,
    limit,
    result: result.reverse(),
  };
};

module.exports.getById = async (id) => {
  const log = await WithdrawLog.findByPk(id);
  if (!log) throw new Error("Withdraw log not found");
  return log;
};

module.exports.update = async (id, { amount, date }) => {
  try {
    const log = await WithdrawLog.findByPk(id);
    if (!log) throw new Error("Withdraw log not found");

    const balance = await UserBalance.findOne({ where: { owner_id: log.owner_id } });
    if (!balance) throw new Error("User balance not found");

    const previousAmount = parseFloat(log.amount);
    const newAmount = parseFloat(amount);
    const difference = newAmount - previousAmount;

    const beforeBalance = parseFloat(balance.balance);

    if (difference > 0 && beforeBalance < difference) {
      throw new Error("Insufficient balance for update");
    }

    const afterBalance = beforeBalance - difference;
    balance.balance = afterBalance;
    await balance.save();

    log.amount = newAmount;
    log.date = date;
    await log.save();

    await UserBalanceLog.create({
      owner_id: log.owner_id,
      reference_type: "withdraw",
      reference_id: log.id,
      amount: -difference,
      balance_before: beforeBalance,
      balance_after: afterBalance,
      date,
    });

    logger.info(`Withdraw updated for ID ${id}, amount changed by ${difference}`);
    return log;
  } catch (err) {
    logger.error(`Withdraw update error (ID ${id}): ${err.message}`);
    throw new Error("Withdraw update failed");
  }
};

module.exports.delete = async (id) => {
  try {
    const log = await WithdrawLog.findByPk(id);
    if (!log) throw new Error("Withdraw log not found");

    const balance = await UserBalance.findOne({ where: { owner_id: log.owner_id } });
    if (!balance) throw new Error("User balance not found");

    const beforeBalance = parseFloat(balance.balance);
    const restoredAmount = parseFloat(log.amount);
    const afterBalance = beforeBalance + restoredAmount;

    balance.balance = afterBalance;
    await balance.save();

    await UserBalanceLog.create({
      owner_id: log.owner_id,
      reference_type: "withdraw",
      reference_id: log.id,
      amount: restoredAmount,
      balance_before: beforeBalance,
      balance_after: afterBalance,
      date: log.date,
    });

    await log.destroy();

    logger.info(`Withdraw deleted: ID ${id}, restored amount ${restoredAmount}`);
    return { success: true, message: "Withdraw log deleted and balance restored" };
  } catch (err) {
    logger.error(`Withdraw delete error (ID ${id}): ${err.message}`);
    throw new Error("Withdraw delete failed");
  }
};
