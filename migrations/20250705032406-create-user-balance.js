"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_balances", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      owner_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "owners",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false,
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_balances");
  },
};
