module.exports = (sequelize, DataTypes) => {
  const SalesTransaction = sequelize.define(
    "SalesTransaction",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      date: {
        type: DataTypes.DATEONLY,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "master_customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false,
      },
      vegetable_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "master_vegetables",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
      weight_per_unit_gram: {
        type: DataTypes.DECIMAL(12, 2),
      },
      total_weight_kg: {
        type: DataTypes.DECIMAL(12, 2),
      },
      price_per_unit: {
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
      tableName: "sales_transactions",
      timestamps: true,
      paranoid: true,
    }
  );
  return SalesTransaction;
};
