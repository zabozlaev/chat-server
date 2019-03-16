module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("message", {
    text: {
      type: DataTypes.STRING
    },
    imageUrl: DataTypes.STRING,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  Message.associate = models => {
    Message.belongsTo(models.Channel, {
      foreignKey: "channel_id"
    });
    Message.belongsTo(models.User, {
      foreignKey: "user_id"
    });
  };

  return Message;
};
