module.exports = (sequelize, DataTypes) => {
  const UserBalance = sequelize.define(
    "UserBalance",
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
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: "user_balances",
      timestamps: true,
      paranoid: true,
    }
  );
  return UserBalance;
};
