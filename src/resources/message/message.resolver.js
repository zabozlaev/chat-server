const db = require("../../models");
const { NEW_CHANNEL_MESSAGE } = require("../utils/subscription.code");
const authMiddleware = require("../utils/auth.middleware");

module.exports = {
  Query: {
    messages: authMiddleware(async (parent, { channelId }, { user }) => {
      const channel = await db.Channel.findById(channelId);
      const member = await db.Member.findOne({
        where: {
          channel_id: channel.id,
          user_id: user.id
        }
      });
      if (!member) {
        throw new Error("You have no rights to handle this channel.");
      }

      const options = {
        order: [["created_at", "DESC"]],
        where: { channel_id: channelId },
        limit: 30
      };
      // TODO: page
      return db.Message.findAll(options, { raw: true });
    })
  },

  Mutation: {
    async createMessage(_, args, { user }) {
      try {
        const message = await Message.create({
          ...args,
          user: user.id
        });
        return message;
      } catch (error) {
        return false;
      }
    }
  }
};
