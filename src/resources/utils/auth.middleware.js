module.exports = resolve => async (parent, args, ctx, info) => {
  if (!ctx.user) {
    throw new Error("Unauthorized.");
  } else if (ctx.user.isBanned) {
    throw new Error("You are banned.");
  }
  resolve(parent, args, ctx, info);
};

/**
 * put a function into resolve arg
 * returns function that args are same
 */
