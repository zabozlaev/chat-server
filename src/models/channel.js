module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define("channel", {
    name: {
      type: DataTypes.STRING
    }
    // public: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: true
    // }
  });

  Channel.associate = models => {
    // manytoone
    Channel.belongsTo(models.User, {
      foreignKey: "owner_id"
    });
    // manytomany
    Channel.belongsToMany(models.User, {
      through: models.Member,
      foreignKey: "channel_id"
    });
  };

  return Channel;
};
