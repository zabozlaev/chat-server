const db = require("../../models");

const authMiddleware = require("../utils/auth.middleware");

module.exports = {
  Query: {
    getDirectMessages: authMiddleware(async (_, args, { user }) => {
      const allMessages = await db.DirectMessage.find({
        where: {
          to: user.id
        }
      });
    })
  },
  Mutation: {}
};
