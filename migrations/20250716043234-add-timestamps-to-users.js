"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
      const tableInfo = await queryInterface.describeTable('users');

      // Tambah kolom createdAt kalau belum ada
      if (!tableInfo['createdAt']) {
          await queryInterface.addColumn('users', 'createdAt', {
              allowNull: false,
              type: Sequelize.DATE,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          });
      }

      // Tambah kolom updatedAt kalau belum ada
      if (!tableInfo['updatedAt']) {
          await queryInterface.addColumn('users', 'updatedAt', {
              allowNull: false,
              type: Sequelize.DATE,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          });
      }
  },

  async down(queryInterface, Sequelize) {
      const tableInfo = await queryInterface.describeTable('users');

      if (tableInfo['createdAt']) {
          await queryInterface.removeColumn('users', 'createdAt');
      }
      if (tableInfo['updatedAt']) {
          await queryInterface.removeColumn('users', 'updatedAt');
      }
  },
};
