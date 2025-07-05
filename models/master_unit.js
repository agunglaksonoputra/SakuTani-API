module.exports = (sequelize, DataTypes) => {
  const MasterUnit = sequelize.define(
    "MasterUnit",
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
      tableName: "master_units",
      timestamps: true,
      paranoid: true,
    }
  );
  return MasterUnit;
};
