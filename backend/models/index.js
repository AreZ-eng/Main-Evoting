const config = require("../configs/db.config.js");
const Sequelize = require("sequelize");
const fs = require("fs");

const sequelize = new Sequelize(config.db, config.user, config.password, {
    host: config.host || "localhost",
    post: config.port,
    dialect: 'postgres',
    timezone: config.timezone,
    logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.admin = require("./admin.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
db.vote = require("./vote.model.js")(sequelize, Sequelize);
db.tps = require("./tps.model.js")(sequelize, Sequelize);

db.user.hasOne(db.vote);
db.vote.belongsTo(db.user);

module.exports = db;
