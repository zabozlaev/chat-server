const { isAuthenticated, channelAccess } = require("../middleware");

const { combineResolvers } = require("graphql-resolvers");

const { pubsub, withFilter, tags } = require("../pubsub");

module.exports = {
  Subscription: {
    newChannelMessage: {
      subscribe: combineResolvers(
        // isAuthenticated,
        channelAccess,
        withFilter(
          () => pubsub.asyncIterator(tags.NEW_CHANNEL_MESSAGE),
          (payload, args) => {
            return payload.channelId === args.channelId;
          }
        )
      )
    },
    userTyping: {
      subscribe: combineResolvers(
        channelAccess,
        withFilter(
          () => pubsub.asyncIterator(tags.USER_TYPING),
          (payload, args) => payload.channelId === args.channelId
        )
      )
    }
  },
  Message: {
    author: ({ author, user_id }, args, { db }) => {
      return author || db.User.findOne({ where: { id: user_id } });
    },
    created: ({ created, created_at }) => created || created_at
  },
  Query: {
    getMessages: combineResolvers(
      isAuthenticated,
      async (_, { channelId, cursor, limit = 100 }, { userId, db }) => {
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
          where: { channel_id: channelId }
          // limit,
          // ...cursorOptions
        };
        // TODO: page
        console.log(
          await db.Message.count({ where: { channel_id: channelId } })
        );

        const messagesFound = await db.Message.findAll(options, { raw: true });

        messagesFound.forEach(message => console.log(message.dataValues));

        return messagesFound;
      }
    )
  },
  Mutation: {
    emitTyping: combineResolvers(
      channelAccess,
      async (_, { channelId }, { userId, db }) => {
        const { username } = await db.User.findOne({
          where: {
            id: userId
          }
        });

        pubsub.publish(tags.USER_TYPING, {
          channelId,
          userTyping: username
        });

        return true;
      }
    ),
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { channelId, text, imageUrl }, { db, userId }) => {
        try {
          const member = await db.Member.findOne({
            where: {
              user_id: userId,
              channel_id: channelId
            }
          });

          if (!member) {
            return {
              success: false,
              errors: [
                {
                  message:
                    "Something went wrong. Are you a member of this chanel? And have you provided the right channelId?",
                  path: "createMessage"
                }
              ]
            };
          }

          const currentUser = await db.User.findOne({
            where: {
              id: userId
            }
          });

          const message = await db.Message.create({
            text,
            imageUrl,
            user_id: userId,
            channel_id: channelId
          });

          pubsub.publish(tags.NEW_CHANNEL_MESSAGE, {
            channelId,
            newChannelMessage: {
              ...message.dataValues,
              author: currentUser.dataValues
            }
          });

          return {
            success: true,
            channel: channelId
          };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            errors: [
              {
                message:
                  "Something went wrong. Are you a member of this chanel? And have you provided the right channelId?",
                path: "createMessage"
              }
            ]
          };
        }
      }
    )
  }
};
