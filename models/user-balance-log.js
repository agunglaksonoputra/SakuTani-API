module.exports = (sequelize, DataTypes) => {
  const UserBalanceLog = sequelize.define(
    "UserBalanceLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      owner_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "owners",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false,
      },
      reference_type: {
        type: DataTypes.ENUM("withdraw", "share_profit", "refund_share_profit"),
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      balance_before: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      balance_after: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "user_balance_logs",
      timestamps: true,
      paranoid: true,
    }
  );
  return UserBalanceLog;
};
