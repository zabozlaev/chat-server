const db = require("../../models");

module.exports = {
  baseAuth: resolve => async (parent, args, ctx, info) => {
    if (!ctx.user) {
      throw new Error("Unauthorized.");
    } else if (ctx.user.isBanned) {
      throw new Error("You are banned.");
    }
    return resolve(parent, args, ctx, info);
  },
  authChannelAccess: resolver => async (parent, { channelId }, ctx) => {
    const { userId } = ctx;
    console.log(userId);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const member = await db.Member.findOne({
      where: { channel_id: channelId, user_id: userId }
    });
    if (!member) {
      throw new Error(
        "You have to be a member of the team to subcribe to it's messages"
      );
    }
    return resolver(parent, { channelId }, ctx);
  }
};

/**
 * put a function into resolve arg
 * returns function that args are same
 */
