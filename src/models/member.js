module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define("member", {
    created_at: DataTypes.DATE,
    isBanned: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue() {
        return false;
      }
    }
  });

  Member.associate = models => {
    Member.belongsTo(models.User, {
      foreignKey: "user_id"
    });
    Member.belongsTo(models.Channel, {
      foreignKey: "channel_id"
    });
  };
  return Member;
};
