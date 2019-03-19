module.exports = (sequelize, DataTypes) => {
  const Invite = sequelize.define("invite", {});

  Invite.associate = db => {
    Invite.belongsTo(db.User, {
      foreignKey: "user_id"
    });
    Invite.belongsTo(db.Channel, {
      foreignKey: "channel_id"
    });
  };
  return Invite;
};
