'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable("password_reset_codes", {
          username: {
              type: Sequelize.STRING,
              allowNull: false,
          },
          code: {
              type: Sequelize.STRING,
              allowNull: false,
          },
          expiresAt: {
              type: Sequelize.DATE,
              allowNull: false,
          },
      });
  },

  async down (queryInterface, Sequelize) {
      await queryInterface.dropTable("password_reset_codes");
  }
};
