const {
  token: { refreshSecret }
} = require("../config");

const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define("refresh_token", {
    token: {
      type: DataTypes.STRING,
      defaultValue() {
        return jwt.sign({ type: "refresh" }, refreshSecret);
      }
    },
    expirationDate: {
      type: DataTypes.DATE,
      defaultValue() {
        return new Date(new Date().getDate() + 12 * 3600 * 1000);
      }
    }
  });

  RefreshToken.associate = models => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: "user_id"
    });
  };

  RefreshToken.prototype.hasExpired = function() {
    return new Date().getTime() < this.expirationDate.getTime();
  };

  return RefreshToken;
};
