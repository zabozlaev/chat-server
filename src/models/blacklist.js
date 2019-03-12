module.exports = (sequelize, DataTypes) => {
  const Blacklist = sequelize.define("blacklist", {
    reason: DataTypes.STRING
  });
  Blacklist.associate = models => {
    Blacklist.belongsTo(models.User, {
      foreignKey: "user_id"
    });
    Blacklist.belongsTo(models.Channel, {
      foreignKey: "channel_id"
    });
  };
  return Blacklist;
};
