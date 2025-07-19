const { User, Role } = require("../models");
const { Op } = require("sequelize");

// Create
module.exports.createUser = async (data) => {
  return await User.create(data);
};

// Read with Pagination
module.exports.getUsers = async (page = 1, limit = 10, search = "") => {
  const offset = (page - 1) * limit;

  const condition = search
    ? {
        username: {
          [Op.iLike]: `%${search}%`,
        },
        deletedAt: {
          [Op.is]: null,
        },
      }
    : {};

  const { rows: users, count: totalItems } = await User.findAndCountAll({
    where: condition,
    attributes: {
      exclude: ["password", "role_id"],
    },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "name"],
      },
    ],
    limit,
    offset,
    order: [["id", "ASC"]],
  });

  return {
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    users,
  };
};

// Get one by ID
module.exports.getUserById = async (id) => {
  return await User.findByPk(id, {
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "name"],
      },
    ],
  });
};

// Update
module.exports.updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  if (data.role && typeof data.role === "string") {
    const roleName = data.role.toLowerCase(); // 🔠 lowercase-kan nama role
    const foundRole = await Role.findOne({ where: { name: roleName } });
    if (!foundRole) throw new Error("Role not found");

    data.role_id = foundRole.id;
    delete data.role;
  }

  return await user.update(data);
};

// Delete
module.exports.deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  return await user.destroy();
};
