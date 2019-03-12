const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          is(value) {
            if (!/^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$/.test(value)) {
              throw new Error("Incorrect username.");
            }
          },
          len: {
            args: [3, 32],
            msg: "Incorrect username."
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: "Incorrect email."
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [8, 32],
            msg: "Password length is incorrect."
          }
        }
      }
    },
    {
      hooks: {
        async beforeCreate(user) {
          console.log(user.password);
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  );

  User.associate = models => {
    User.belongsToMany(models.Channel, {
      through: models.Member,
      foreignKey: "user_id"
    });
  };

  User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
