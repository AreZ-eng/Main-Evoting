module.exports = (sequelize, Sequelize) => {
    const Vote = sequelize.define("vote", {
        userId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        proses: {
            type: Sequelize.ENUM("belum memilih", "sedang memilih", "sudah memilih"),
            defaultValue: "belum memilih",
            allowNull: false
        },
        hash: {
            type: Sequelize.STRING,
            unique: true, 
            allowNull: true
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
        timestamps: false,
    });

    return Vote;
};
