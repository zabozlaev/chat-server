const Sequelize = require("sequelize");

const path = require("path");

const {
  database: { name, password, user }
} = require("../config");

const sequelize = new Sequelize(name, user, password, {
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
  operatorsAliases: Sequelize.Op,
  // logging: false,
  underscored: true,
  define: {
    charset: "utf8",
    timestamps: false,
    freezeTableName: true,
    underscored: true
  }
});

const db = {
  User: sequelize.import("./user"),
  Channel: sequelize.import("./channel"),
  Message: sequelize.import("./message"),
  Member: sequelize.import("./member"),
  RefreshToken: sequelize.import("./refreshToken"),
  Blacklist: sequelize.import("./blacklist"),
  DirectMessage: sequelize.import("./directMessage")
};

Object.keys(db).forEach(modelName => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = sequelize;

module.exports = db;
