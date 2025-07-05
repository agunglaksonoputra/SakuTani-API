module.exports = (sequelize, DataTypes) => {
  const ExpensesTransaction = sequelize.define(
    "ExpensesTransaction",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price_per_unit: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      shipping_cost: {
        type: DataTypes.DECIMAL(12, 2),
      },
      discount: {
        type: DataTypes.DECIMAL(12, 2),
      },
      total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
    },
    {
      tableName: "expenses_transactions",
      timestamps: true,
      paranoid: true,
    }
  );
  return ExpensesTransaction;
};
