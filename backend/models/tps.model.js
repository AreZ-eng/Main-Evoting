module.exports = (sequelize, Sequelize) => {
    const Tps = sequelize.define("tps", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        alamat: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    return Tps;
};
