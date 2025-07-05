module.exports = (sequelize, DataTypes) => {
  const MasterVegetable = sequelize.define(
    "MasterVegetable",
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
      tableName: "master_vegetables",
      timestamps: true,
      paranoid: true,
    }
  );
  return MasterVegetable;
};
