const db = require("../../models");

const { baseAuth } = require("../utils/auth.middleware");

module.exports = {
  DirectMessage: {
    sender: data => {
      const { sender, from } = data;

      return sender
        ? sender
        : db.User.findOne({
            where: {
              id: from
            }
          });
    },
    receiver: ({ receiver, to }) => {
      return receiver
        ? receiver
        : db.User.findOne({
            where: {
              id: to
            }
          });
    }
  },
  Query: {
    getDirectMessages: baseAuth(async (_, args, { userId }) => {
      const allMessages = await db.DirectMessage.find({
        where: {
          to: userId
        }
      });

      return allMessages;
    })
  },
  Mutation: {
    sendDirectMessage: baseAuth(async (_, { text, to }, { userId }) => {
      if (to === userId) {
        return {
          success: false,
          error: {
            message: "can't send message..."
          }
        };
      }

      const receiver = await db.User.findOne({
        where: {
          id: to
        }
      });
      if (!receiver) {
        return {
          success: false,
          errors: [
            {
              message: "Can't find a user to receive a message."
            }
          ]
        };
      }

      const dirMsg = await db.DirectMessage.create(
        {
          text,
          to,
          from: userId
        },
        { raw: true }
      );

      const response = {
        message: dirMsg.dataValues,
        success: true
      };

      console.log(response);
      return response;
    })
  }
};
