const express = require("express");
const { json, urlencoded } = require("body-parser");
const cors = require("cors");
const { ApolloServer, makeExecutableSchema } = require("apollo-server-express");

const app = express();
const db = require("./models");
const { decode } = require("./auth");
const schemaLoaded = require("./utils/loadSchema");

app.use(cors("*"));
app.use(json());
app.use(urlencoded({ extended: false }));

const force = false;

module.exports = async () => {
  await db.sequelize.sync({ force });

  const schema = makeExecutableSchema(schemaLoaded);

  const server = new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
      const userId =
        req && req.headers.authorization
          ? (await decode(req.headers.authorization)).userId
          : connection && connection.context && connection.context.userId;

      console.log(userId);

      return {
        req,
        db,
        userId
      };
    },
    subscriptions: {
      onConnect: async (connectionParams, ws, ctx) => {
        if (connectionParams.authorization) {
          let user_id;

          if ((user_id = await decode(connectionParams.authorization))) {
            console.log(user_id);
            return {
              user: {
                userId: user_id
              }
            };
          }
        }

        throw new Error("Authorization required");
      }
    }
  });

  server.applyMiddleware({ app });

  const httpServer = require("http").createServer(app);

  server.installSubscriptionHandlers(httpServer);

  httpServer.listen(require("./config").port);
};
