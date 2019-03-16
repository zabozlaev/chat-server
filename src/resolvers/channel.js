const { isAuthenticated } = require("../middleware");

const { combineResolvers } = require("graphql-resolvers");

module.exports = {
  Query: {
    getChannels: combineResolvers(
      isAuthenticated,
      async (parent, args, { db, userId }) => {
        const result = await db.sequelize.query(
          `
          select * from channel join member on member.channel_id = channel.id where member.user_id = ? 
          `,
          {
            replacements: [userId],
            models: db.Channel,
            raw: true
          }
        );

        return result[0];
      }
    )
  },
  Mutation: {
    createChannel: combineResolvers(
      isAuthenticated,
      async (parent, { name }, { db, userId }) => {
        const exists = await db.Channel.findOne({
          where: {
            name
          }
        });
        if (exists) {
          return {
            success: false,
            errors: [
              {
                message: "Channel already exists",
                path: "createChannel"
              }
            ]
          };
        }

        try {
          const transactionResult = await db.sequelize.transaction(
            async transaction => {
              const channel = await db.Channel.create(
                {
                  name,
                  owner_id: userId
                },
                { transaction }
              );
              await db.Member.create(
                {
                  user_id: userId,
                  channel_id: channel.id,
                  isAdmin: true
                },
                { transaction }
              );
              return channel;
            }
          );
          return {
            success: true,
            channel: transactionResult
          };
        } catch (error) {
          return {
            success: false,
            errors: [
              {
                path: "createChannel",
                message: "Something went wrong"
              }
            ]
          };
        }
      }
    )
  },
  Subscription: {}
};
