const authMiddleware = require("../utils/auth.middleware");
const db = require("../../models");

module.exports = {
  Query: {
    getChannelMembers: authMiddleware(async (parent, { channelId }) => {
      return db.sequelize.query(
        `
        select * from user as u join members as mem on mem.user_id = u.id where m.channel_id = ?
      `,
        {
          replacements: [channelId],
          models: db.User,
          raw: true
        }
      );
    })
  },
  Mutation: {
    createChannel: authMiddleware(async (_, args, { user }) => {
      try {
        const transactionRes = await db.sequelize.transaction(
          async transaction => {
            const channel = await db.Channel.create(
              {
                ...args
              },
              { transaction }
            );
            await db.Member.create(
              {
                user_id: user.id,
                channel_id: channel.id
              },
              { transaction }
            );
            return channel;
          }
        );

        return {
          channel: transactionRes
        };
      } catch (error) {
        return {
          path: "createChannel",
          message: error.message
        };
      }
    })
  }
};
