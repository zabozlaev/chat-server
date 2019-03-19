const express = require("express");
const { json, urlencoded } = require("body-parser");
const cors = require("cors");
const {
  ApolloServer,
  makeExecutableSchema,
  ForbiddenError
} = require("apollo-server-express");

const expressRateLimit = require("express-rate-limit");

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

  const limiter = expressRateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: JSON.stringify({
      message: "Too many requests from this ip decected.",
      path: "request",
      code: 429
    })
  });

  app.use(limiter);

  const server = new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
      let userId =
        req && req.headers.authorization
          ? (await decode(req.headers.authorization))
            ? (await decode(req.headers.authorization)).userId
            : null
          : connection && connection.context && connection.context.userId;

      return {
        req,
        db,
        userId
      };
    },
    subscriptions: {
      onConnect: async (connectionParams, ws, ctx) => {
        if (connectionParams.authorization) {
          let userDecoded;

          if ((userDecoded = await decode(connectionParams.authorization))) {
            return {
              userId: userDecoded.userId
            };
          }
        }

        throw new ForbiddenError("Authorization required.");
      }
    }
  });

  server.applyMiddleware({ app });

  const httpServer = require("http").createServer(app);

  server.installSubscriptionHandlers(httpServer);

  httpServer.listen(require("./config").port);
};
