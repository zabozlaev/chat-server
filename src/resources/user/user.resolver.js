const _ = require("lodash");

const authMiddleware = require("../utils/auth.middleware");

const { createToken } = require("../utils/jwt.service");

const db = require("../../models");

const formatErrors = (e, db) => {
  if (e instanceof db.sequelize.ValidationError) {
    return e.errors.map(x => _.pick(x, ["path", "message"]));
  }
  return [{ path: "Server error.", Message: "someting went wrong." }];
};

module.exports = {
  User: {
    channels: (parent, args, { user }) =>
      db.sequelize.query(
        `
        select * from channel join member on channel.id = member.channel_id where member.user_id = ?
      `,
        {
          replacements: [user.id],
          models: db.Channel,
          raw: true
        }
      )
  },
  Query: {
    hello: _ => {
      return "string";
    },
    me: authMiddleware((_, __, { user }) => {
      return db.User.findOne({
        where: {
          id: user.id
        }
      });
    }),
    allUsers() {
      return db.User.findAll();
    }
  },
  Mutation: {
    async register(parent, { input }) {
      try {
        const user = await db.User.create(input);
        return {
          success: true,
          user
        };
      } catch (error) {
        return {
          success: false,
          errors: formatErrors(error, db)
        };
      }
    },
    async login(parent, { email, password }) {
      const user = await db.User.findOne({
        where: {
          email
        }
      });
      if (!user || !(await user.comparePassword(password))) {
        throw new Error("No user found.");
      }

      const { token } = createToken({ userId: user.id });
      const refreshToken = await db.RefreshToken.create({ user_id: 1 });

      return {
        refreshToken: refreshToken.token,
        accessToken: token
      };
    },
    async refreshToken(_, { token }) {
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
