module.exports = (sequelize, DataTypes) => {
  const MonthlyReport = sequelize.define(
    "MonthlyReport",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_sales: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total_expenses: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total_profit: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: "monthly_reports",
      timestamps: true,
      paranoid: true,
    }
  );
  return MonthlyReport;
};
