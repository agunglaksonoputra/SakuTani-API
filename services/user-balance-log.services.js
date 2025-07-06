const { UserBalanceLog } = require("../models");

module.exports.getAll = async () => {
  return await UserBalanceLog.findAll({ order: [["createdAt", "DESC"]] });
};

module.exports.getById = async (id) => {
  return await UserBalanceLog.findByPk(id);
};

module.exports.create = async (data) => {
  return await UserBalanceLog.create(data);
};

module.exports.update = async (id, data) => {
  const log = await UserBalanceLog.findByPk(id);
  if (!log) throw new Error("Log not found");
  await log.update(data);
  return log;
};

module.exports.remove = async (id) => {
  const log = await UserBalanceLog.findByPk(id);
  if (!log) throw new Error("Log not found");
  await log.destroy();
  return { success: true };
};
