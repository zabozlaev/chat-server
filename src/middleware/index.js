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
      return new ForbiddenError("Forbidden.");
    }
  }
);

const channelAccess = async (parent, { channelId }, { userId }) => {
  if (!userId) {
    return new AuthenticationError("Not authenticated");
  }

  try {
    const member = await db.Member.findOne({
      where: { channel_id: channelId, user_id: userId }
    });
    if (!member) {
      return new ForbiddenError(
        "You have to be a member of the team to subcribe to it's messages"
      );
    }
    return skip;
  } catch (error) {
    console.log(error);
    return new ForbiddenError(
      "You have to be a member of the team to subcribe to it's messages"
    );
  }

  // check if part of the team
};

const directMessageAccess = async (parent, { ownUserId }, { db, userId }) => {
  return !ownUserId || !userId || userId !== ownUserId
    ? new ForbiddenError("Stop you little hacker!")
    : skip;
};

const channelOwnerAccess = async (parent, { channelId }, { db, userId }) => {
  const isAdmin = await db.Member.findOne({
    where: {
      user_id: userId,
      channel_id: channelId,
      isAdmin: true
    }
  });

  if (!isAdmin) {
    return new ForbiddenError("You're not an owner.");
  }

  return skip;
};

module.exports = {
  isAdmin,
  isAuthenticated,
  channelAccess,
  channelOwnerAccess
};
