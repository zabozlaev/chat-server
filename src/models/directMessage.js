module.exports = (sequelize, DataTypes) => {
  const DirectMessage = sequelize.define(
    "direct_message",
    {
      text: {
        type: DataTypes.STRING
      }
    },
    { timestamps: true }
  );

  DirectMessage.associate = models => {
    DirectMessage.belongsTo(models.User, {
      foreignKey: "to"
    });

    DirectMessage.belongsTo(models.User, {
      foreignKey: "from"
    });
  };

  return DirectMessage;
};
