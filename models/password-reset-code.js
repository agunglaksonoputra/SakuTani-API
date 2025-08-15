module.exports = (sequelize, DataTypes) => {
    const PasswordResetCode = sequelize.define("PasswordResetCode", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: "password_reset_codes",
        timestamps: false,
        id: false
    });

    return PasswordResetCode;
};