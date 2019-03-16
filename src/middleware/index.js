const { combineResolvers, skip } = require("graphql-resolvers");

const db = require("../models");

const {
  ForbiddenError,
  AuthenticationError
} = require("apollo-server-express");

const isAuthenticated = async (parent, args, ctx) => {
  const { userId } = ctx;
  return userId ? skip : new AuthenticationError("You are unauthorized.");
};
const isAdmin = combineResolvers(
  isAuthenticated,
  async (parent, args, { userId }) => {
    try {
      const member = await db.Member.findOne({
        where: {
          user_id: userId,
          channel_id: args.channelId
        }
      });
      return member.isAdmin ? skip : new ForbiddenError("You're not an admin.");
    } catch (error) {
      throw new ForbiddenError("Forbidden.");
    }
  }
);

const channelAccess = async (parent, { channelId }, { userId }) => {
  if (!userId) {
    return new AuthenticationError("Not authenticated");
  }
  // check if part of the team
  const channel = await db.Channel.findOne({ where: { id: channelId } });
  const member = await db.Member.findOne({
    where: { channel_id: channelId, userId: userId }
  });
  if (!member) {
    return new ForbiddenError(
      "You have to be a member of the team to subcribe to it's messages"
    );
  }
  return skip;
};

module.exports = {
  isAdmin,
  isAuthenticated,
  channelAccess
};
