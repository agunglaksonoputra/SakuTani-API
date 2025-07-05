const { Owner } = require("../models");

module.exports.getAllOwners = async () => {
  return await Owner.findAll();
};

module.exports.getOwnerById = async (id) => {
  return await Owner.findByPk(id);
};

module.exports.createOwner = async (data) => {
  return await Owner.create(data);
};

module.exports.deleteOwner = async (id) => {
  const result = await Owner.findByPk(id);
  if (!result) throw new Error("Owner not found");
  return await result.destroy();
};

module.exports.getAllOwners = async () => {
  return await Owner.findAll();
};

module.exports.getOwnerById = async (id) => {
  return await Owner.findByPk(id);
};

module.exports.createOwner = async (data) => {
  return await Owner.create(data);
};

module.exports.deleteOwner = async (id) => {
  const result = await Owner.findByPk(id);
  if (!result) throw new Error("Owner not found");
  return await result.destroy();
};
