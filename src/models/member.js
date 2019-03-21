module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define(
    "member",
    {
      is_banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: () => false
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue() {
          return false;
        }
      }
    },
    { timestamps: true }
  );

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
