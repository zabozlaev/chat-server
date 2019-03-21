const { isAuthenticated } = require("../middleware");

const { combineResolvers } = require("graphql-resolvers");

const { createToken } = require("../auth");

const { validationErrors } = require("../utils/prettifyError");

module.exports = {
  User: {
    channels: (parent, args, { db, userId }) =>
      db.sequelize.query(
        "select * from channel join member on channel.id = member.channel_id where member.user_id = ?",
        {
          replacements: [userId],
          model: db.Channel,
          raw: true
        }
      ),
    avatarUrl: ({ avatarUrl, avatar_url }) => avatarUrl || avatar_url
  },
  Query: {
    me: combineResolvers(isAuthenticated, (_, __, { userId, db }) => {
      return db.User.findOne({
        where: {
          id: userId
        }
      });
    }),
    allUsers(_, __, { db }) {
      return db.User.findAll();
    },
    userNumber: (_, __, { db }) => db.User.count({})
  },
  Mutation: {
    async register(parent, { input }, { db }) {
      try {
        const user = await db.User.create(input);
        return {
          success: true,
          user
        };
      } catch (error) {
        return {
          success: false,
          errors: validationErrors(error)
        };
      }
    },
    async login(parent, { email, password }, { db }) {
      const user = await db.User.findOne({
        where: {
          email
        }
      });
      if (!user || !(await user.comparePassword(password))) {
        return {
          errors: [
            {
              path: "Login",
              message: "Wrong credentials provided."
            }
          ]
        };
      }

      const { token } = createToken({ userId: user.id });
      const refreshToken = await db.RefreshToken.create({ user_id: 1 });

      return {
        refreshToken: refreshToken.token,
        accessToken: token
      };
    },
    async refreshToken(_, { token }, { db }) {
      const tokenFound = await db.RefreshToken.findOne({
        token
      });
      if (!tokenFound) {
        throw new Error("Incorrect token provided.");
      }
      if (tokenFound.hasExpired()) {
        await tokenFound.destroy();
        throw new Error("RefreshToken has expired.");
      }

      const createdToken = createToken({ userId: tokenFound.user_id });
      const refreshToken = await db.RefreshToken.create({ user_id: 1 });
      await tokenFound.destroy();
      return {
        accessToken: createdToken.token,
        refreshToken
      };
    }
  }
};
