module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define(
    "Owner",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      share_percentage: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "owners",
      timestamps: true,
      paranoid: true,
    }
  );

  Owner.associate = (models) => {
    Owner.hasOne(models.UserBalance, {
      foreignKey: "owner_id",
    });
  };

  return Owner;
};
