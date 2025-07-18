"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sales_transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "master_customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false,
      },
      vegetable_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "master_vegetables",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false,
      },
      quantity: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      unit_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "master_units",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false,
      },
      weight_per_unit_gram: {
        type: Sequelize.DECIMAL(12, 2),
      },
      total_weight_kg: {
        type: Sequelize.DECIMAL(12, 2),
      },
      price_per_unit: {
        type: Sequelize.DECIMAL(12, 2),
      },
      total_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
    await queryInterface.dropTable("sales_transactions");
  },
};
