const { MasterCustomer, MasterVegetable, MasterUnit, Owner } = require("../models");

module.exports.getAll = async () => {
  const customers = await MasterCustomer.findAll({
    attributes: ["name"],
    raw: true,
  });

  const vegetables = await MasterVegetable.findAll({
    attributes: ["name"],
    raw: true,
  });

  const units = await MasterUnit.findAll({
    attributes: ["name"],
    raw: true,
  });

  const owners = await Owner.findAll({
    attributes: ["name"],
    raw: true,
  });

  return {
    customers: customers.map((c) => c.name),
    vegetables: vegetables.map((v) => v.name),
    units: units.map((u) => u.name),
    owners: owners.map((o) => o.name),
  };
};
