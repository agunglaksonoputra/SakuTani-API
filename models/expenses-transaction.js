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
      unit_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "master_units",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
    },
    {
      tableName: "expenses_transactions",
      timestamps: true,
      paranoid: true,
    }
  );

  ExpensesTransaction.associate = (models) => {
    ExpensesTransaction.belongsTo(models.MasterUnit, { as: "unit", foreignKey: "unit_id" });
    ExpensesTransaction.belongsTo(models.User, { as: "user", foreignKey: "created_by" });
  };

  return ExpensesTransaction;
};
