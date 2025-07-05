"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("monthly_reports", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      total_sales: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      total_expenses: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      total_profit: {
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("monthly_reports");
  },
};
