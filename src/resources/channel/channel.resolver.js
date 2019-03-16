const { baseAuth, authChannelAccess } = require("../utils/auth.middleware");
const db = require("../../models");

const { pubsub, withFilter } = require("../pubsub");

const { NEW_CHANNEL_MESSAGE } = require("../utils/subscription.code");

const { isAuthenticated } = require("../auth.js");

const { combineResolvers, skip } = require("graphql-resolvers");

module.exports = {
  Subscription: {
    // userBlocked: {
    //   subscribe: authChannelAccess(
    //     withFilter(
    //       () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
    //       (payload, args) => payload.channel_id === args.channelId
    //     )
    //   )
    // }
  },
  Channel: {
    members: ({
      channel: {
        channel: { id }
      }
    }) => {
      return db.sequelize.query(
        `select * from user join member on member.user_id = user.id where member.channel_id = ?`,
        {
          replacements: [id],
          models: db.User,
          raw: true
        }
      );
    },
    owner: ({ owner_id, owner }) => {
      return owner
        ? owner
        : db.User.findOne({
            where: {
              id: owner_id
            }
          });
    }
  },

  Query: {
    getChannelMembers: baseAuth(async (parent, { channelId }) => {
      return db.sequelize.query(
        `
        select * from user join member on member.user_id = user.id where member.channel_id = ?
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
    inviteUser: baseAuth(async (_, { channelId, newUserId }, { userId }) => {
      try {
        const channel = await db.Channel.findOne({
          where: {
            id: channelId
          }
        });

        if (!channel) {
          return {
            success: false,
            errors: [
              {
                path: "Invite. Forbidden.",
                message: "No such channel."
              }
            ]
          };
        }

        const admin = await db.Member.find({
          where: {
            user_id: newUserId,
            channel_id: channelId
          }
        });

        if (!admin.isAdmin) {
          return {
            success: false,
            errors: [
              {
                path: "Invite. Forbidden.",
                message: "You're not an admin"
              }
            ]
          };
        }

        const newMember = await db.Member.create({
          user_id: newUserId,
          channel_id: channelId
        });

        return {
          success: true,
          user: newMember
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          path: "inviteUser",
          message: error.message
        };
      }
    }),
    createChannel: combineResolvers(
      isAuthenticated,
      async (_, args, { user }) => {
        try {
          const transactionRes = await db.sequelize.transaction(
            async transaction => {
              const channel = await db.Channel.create(
                {
                  ...args,
                  owner_id: userId
                },
                { transaction }
              );
              const member = await db.Member.create(
                {
                  user_id: userId,
                  channel_id: channel.id,
                  isAdmin: true
                },
                { transaction }
              );
              return {
                member,
                channel
              };
            }
          );

          return {
            success: true,
            channel: transactionRes
          };
        } catch (error) {
          return {
            success: false,
            path: "createChannel",
            message: error.message
          };
        }
      }
    ),
    blockUser: combineResolvers(
      isAuthenticated,
      async (_, { badUserId, channelId, reason }, { userId }) => {
        try {
          const member = await db.Member.findOne({ where: { id: userId } });
          if (!member.isAdmin) {
            return {
              success: false,
              errors: [
                {
                  path: "blockUser",
                  message: "no rights man."
                }
              ]
            };
          }
          const channel = await db.Channel.findOne({
            where: {
              id: channelId
            }
          });

          if (!channel) {
            return {
              success: false,
              errors: [
                {
                  path: "blockUser",
                  message: "no rights man."
                }
              ]
            };
          }

          const userToBlock = await db.User.findOne({
            where: {
              id: badUserId
            }
          });

          if (!userToBlock) {
            return {
              success: false,
              errors: [
                {
                  path: "blockUser",
                  message: "No user found."
                }
              ]
            };
          }

          await db.Blacklist.create({
            channel_id: channelId,
            user_id: badUserId,
            reason
          });

          console.log("there");

          return {
            success: true,
            user: userToBlock,
            reason
          };
        } catch (error) {
          return {
            success: false,
            erorrs: [
              {
                message: "something went wrong",
                path: "Internal server error."
              }
            ]
          };
        }
      }
    )
  }
};
