const db = require("../../models");
const { NEW_CHANNEL_MESSAGE } = require("../utils/subscription.code");
const { baseAuth } = require("../utils/auth.middleware");

const { pubsub, withFilter } = require("../pubsub");

const { isAuthenticated } = require("../auth.js");

const { combineResolvers, skip } = require("graphql-resolvers");

module.exports = {
  Query: {
    messages: combineResolvers(
      isAuthenticated,
      async (parent, { channelId, cursor, limit = 100 }, { userId }) => {
        const channel = await db.Channel.findByPk(channelId);
        const member = await db.Member.findOne({
          where: {
            channel_id: channel.id,
            user_id: userId
          }
        });
        if (!member) {
          throw new Error("You have no rights to handle this channel.");
        }

        const cursorOptions = cursor
          ? {
              where: {
                created_at: {
                  [db.Sequelize.Op.lt]: cursor
                }
              }
            }
          : {};

        const options = {
          order: [["created_at", "DESC"]],
          where: { channel_id: channelId },
          limit,
          ...cursorOptions
        };
        // TODO: page
        return db.Message.findAll(options, { raw: true });
      }
    )
  },

  Mutation: {
    async createMessage(_, args, { userId }) {
      try {
        const message = await Message.create({
          ...args,
          user: userId
        });
        return message;
      } catch (error) {
        return false;
      }
    }
  }
};
