module.exports = (sequelize, DataTypes) => {
  const ProfitShare = sequelize.define(
    "ProfitShare",
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
    },
    {
      tableName: "profit_shares",
      timestamps: true,
      paranoid: true,
    }
  );
  return ProfitShare;
};
