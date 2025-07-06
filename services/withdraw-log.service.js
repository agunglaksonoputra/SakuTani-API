const { WithdrawLog, UserBalance, UserBalanceLog } = require("../models");

module.exports.create = async ({ owner_id, amount, date }) => {
  const balance = await UserBalance.findOne({ where: { owner_id } });
  if (!balance) throw new Error("User balance not found");

  const currentBalance = parseFloat(balance.balance);
  const withdrawAmount = parseFloat(amount);

  if (withdrawAmount > currentBalance) {
    throw new Error("Insufficient balance");
  }

  // Simpan log withdraw
  const log = await WithdrawLog.create({ owner_id, amount: withdrawAmount, date });

  // Kurangi saldo user
  const newBalance = currentBalance - withdrawAmount;
  balance.balance = newBalance;
  await balance.save();

  await UserBalanceLog.create({
    owner_id,
    reference_type: "withdraw",
    reference_id: log.id,
    amount: -withdrawAmount,
    balance_before: currentBalance,
    balance_after: newBalance,
    date,
  });

  return log;
};

module.exports.getAll = async () => {
  return await WithdrawLog.findAll();
};

module.exports.getById = async (id) => {
  const log = await WithdrawLog.findByPk(id);
  if (!log) throw new Error("Withdraw log not found");
  return log;
};

module.exports.update = async (id, { amount, date }) => {
  const log = await WithdrawLog.findByPk(id);
  if (!log) throw new Error("Withdraw log not found");

  const balance = await UserBalance.findOne({ where: { owner_id: log.owner_id } });
  if (!balance) throw new Error("User balance not found");

  const previousAmount = parseFloat(log.amount);
  const newAmount = parseFloat(amount);

  // Hitung selisih perubahan
  const difference = newAmount - previousAmount;

  if (difference > 0 && parseFloat(balance.balance) < difference) {
    throw new Error("Insufficient balance for update");
  }

  const beforeBalance = parseFloat(balance.balance);
  const afterBalance = beforeBalance - difference;

  // Update saldo berdasarkan selisih
  balance.balance = afterBalance;
  await balance.save();

  // Update log
  log.amount = newAmount;
  log.date = date;
  await log.save();

  // Tambahkan log saldo perubahan withdraw
  await UserBalanceLog.create({
    owner_id: log.owner_id,
    reference_type: "withdraw",
    reference_id: log.id,
    amount: -difference,
    balance_before: beforeBalance,
    balance_after: afterBalance,
    date,
  });

  return log;
};

module.exports.delete = async (id) => {
  const log = await WithdrawLog.findByPk(id);
  if (!log) throw new Error("Withdraw log not found");

  const balance = await UserBalance.findOne({ where: { owner_id: log.owner_id } });
  if (!balance) throw new Error("User balance not found");

  const beforeBalance = parseFloat(balance.balance);
  const afterBalance = beforeBalance + parseFloat(log.amount);

  // Kembalikan jumlah yang diwithdraw ke saldo
  balance.balance = afterBalance;
  await balance.save();

  // Simpan log pengembalian saldo karena delete
  await UserBalanceLog.create({
    owner_id: log.owner_id,
    reference_type: "withdraw",
    reference_id: log.id,
    amount: parseFloat(log.amount),
    balance_before: beforeBalance,
    balance_after: afterBalance,
    date: log.date,
  });

  await log.destroy(); // soft delete
  return { success: true, message: "Withdraw log deleted and balance restored" };
};
