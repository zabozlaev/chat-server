const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "users",
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
      },
      avatar_url: {
        type: DataTypes.STRING
      }
    },
    {
      hooks: {
        async beforeCreate(user) {
          if (!user.avatar_url) {
            generated = crypto
              .createHash("md5")
              .update(user.email)
              .digest("hex");

            user.avatar_url = `https://www.gravatar.com/avatar/${generated}?s=32&d=identicon&r=PG`;
          }
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
