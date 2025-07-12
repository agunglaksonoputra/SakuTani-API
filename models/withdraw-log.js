module.exports = (sequelize, DataTypes) => {
  const WithdrawLog = sequelize.define(
    "WithdrawLog",
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
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
    },
    {
      tableName: "withdraw_logs",
      timestamps: true,
      paranoid: true,
    }
  );

  WithdrawLog.associate = (models) => {
    WithdrawLog.belongsTo(models.Owner, {
      foreignKey: "owner_id",
      as: "owner",
    });
  };

  return WithdrawLog;
};
