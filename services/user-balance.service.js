const { ProfitShare, WithdrawLog, UserBalance, Owner } = require("../models");
const logger = require("../utils/logger");

module.exports.getAll = async () => {
  try {
    const results = await UserBalance.findAll({
      attributes: ["balance"],
      include: [
        {
          model: Owner,
          attributes: ["name"],
        },
      ],
      raw: true,
      nest: true,
    });

    logger.info("Fetched all user balances with owner names");

    return results.map((item) => ({
      name: item.Owner.name,
      balance: item.balance,
    }));
  } catch (error) {
    logger.error(`Error in getAll: ${error.message}`);
    throw new Error("Failed to retrieve user balances");
  }
};

module.exports.getByOwner = async (ownerId) => {
  try {
    const balance = await UserBalance.findOne({ where: { owner_id: ownerId } });
    if (!balance) logger.warn(`No balance found for owner ID ${ownerId}`);
    return balance;
  } catch (error) {
    logger.error(`Error in getByOwner (${ownerId}): ${error.message}`);
    throw new Error("Failed to retrieve user balance by owner");
  }
};

module.exports.recalculateBalance = async (ownerId) => {
  try {
    const [profit, withdraw] = await Promise.all([ProfitShare.sum("amount", { where: { owner_id: ownerId } }), WithdrawLog.sum("amount", { where: { owner_id: ownerId } })]);

    const totalProfit = profit || 0;
    const totalWithdraw = withdraw || 0;
    const balance = totalProfit - totalWithdraw;

    let userBalance = await UserBalance.findOne({ where: { owner_id: ownerId } });

    if (userBalance) {
      userBalance.balance = balance;
      await userBalance.save();
      logger.info(`Recalculated balance for owner ID ${ownerId}, updated to ${balance}`);
    } else {
      userBalance = await UserBalance.create({ owner_id: ownerId, balance });
      logger.info(`Created new balance for owner ID ${ownerId} with amount ${balance}`);
    }

    return userBalance;
  } catch (error) {
    logger.error(`Error in recalculateBalance (${ownerId}): ${error.message}`);
    throw new Error("Failed to recalculate user balance");
  }
};

module.exports.delete = async (ownerId) => {
  try {
    const balance = await UserBalance.findOne({ where: { owner_id: ownerId } });
    if (!balance) {
      logger.warn(`User balance not found for owner ID ${ownerId}`);
      throw new Error("User balance not found");
    }

    await balance.destroy(); // soft delete
    logger.info(`Deleted balance for owner ID ${ownerId}`);
  } catch (error) {
    logger.error(`Error in delete (${ownerId}): ${error.message}`);
    throw new Error("Failed to delete user balance");
  }
};

module.exports.generateAll = async () => {
  try {
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
        logger.info(`Updated balance for owner ID ${owner.id} to ${balance}`);
      } else {
        await UserBalance.create({
          owner_id: owner.id,
          balance,
        });
        logger.info(`Created balance for new owner ID ${owner.id} with amount ${balance}`);
      }
    }

    return { success: true, message: "User balances generated successfully" };
  } catch (error) {
    logger.error(`Error in generateAll: ${error.message}`);
    throw new Error("Failed to generate all user balances");
  }
};

module.exports.getTotalUserBalance = async () => {
  try {
    const total = await UserBalance.sum("balance");
    logger.info("Calculated total user balance");
    return total || 0;
  } catch (error) {
    logger.error(`Error in getTotalUserBalance: ${error.message}`);
    throw new Error("Failed to calculate total user balance");
  }
};
