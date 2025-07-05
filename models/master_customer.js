module.exports = (sequelize, DataTypes) => {
  const MasterCustomer = sequelize.define(
    "MasterCustomer",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "master_customers",
      timestamps: true,
      paranoid: true,
    }
  );
  return MasterCustomer;
};
