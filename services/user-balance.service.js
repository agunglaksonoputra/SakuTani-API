const { ProfitShare, WithdrawLog, UserBalance, Owner } = require("../models");

module.exports.getAll = async () => {
  return await UserBalance.findAll();
};

module.exports.getByOwner = async (ownerId) => {
  return await UserBalance.findOne({ where: { owner_id: ownerId } });
};

module.exports.recalculateBalance = async (ownerId) => {
  const [profit, withdraw] = await Promise.all([ProfitShare.sum("amount", { where: { owner_id: ownerId } }), WithdrawLog.sum("amount", { where: { owner_id: ownerId } })]);

  const totalProfit = profit || 0;
  const totalWithdraw = withdraw || 0;
  const balance = totalProfit - totalWithdraw;

  let userBalance = await UserBalance.findOne({ where: { owner_id: ownerId } });

  if (userBalance) {
    userBalance.balance = balance;
    await userBalance.save();
  } else {
    userBalance = await UserBalance.create({ owner_id: ownerId, balance });
  }

  return userBalance;
};

module.exports.delete = async (ownerId) => {
  const balance = await UserBalance.findOne({ where: { owner_id: ownerId } });
  if (!balance) throw new Error("User balance not found");
  await balance.destroy(); // soft delete
};

module.exports.generateAll = async () => {
  const owners = await Owner.findAll();

  for (const owner of owners) {
    const [profit, withdraw] = await Promise.all([ProfitShare.sum("amount", { where: { owner_id: owner.id } }), WithdrawLog.sum("amount", { where: { owner_id: owner.id } })]);

    const totalProfit = profit || 0;
    const totalWithdraw = withdraw || 0;
    const balance = totalProfit - totalWithdraw;

    const existing = await UserBalance.findOne({ where: { owner_id: owner.id } });

    if (existing) {
      existing.balance = balance;
      await existing.save();
    } else {
      await UserBalance.create({
        owner_id: owner.id,
        balance,
      });
    }
  }

  return { success: true, message: "User balances generated successfully" };
};
