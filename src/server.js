const express = require("express");

const { json, urlencoded } = require("body-parser");

const cors = require("cors");

const { ApolloServer, makeExecutableSchema } = require("apollo-server-express");

const {
  fileLoader,
  mergeTypes,
  mergeResolvers
} = require("merge-graphql-schemas");

const path = require("path");

const db = require("./models");

const app = express();

app.use(cors("*"));

app.use(json());
app.use(urlencoded({ extended: false }));

const { decode } = require("./resources/utils/jwt.service");

module.exports = async () => {
  await db.sequelize.sync({ force: true });

  const typeDefs = mergeTypes(
    fileLoader(path.join(__dirname, "/resources/**/*.schema.graphql"))
  );

  const resolvers = mergeResolvers(
    fileLoader(path.join(__dirname, "/resources/**/*.resolver.js"))
  );

  const schema = makeExecutableSchema({ resolvers, typeDefs });

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const user = await decode(req.headers.authorization);

      return { user };
    }
  });

  server.applyMiddleware({ app });

  const httpServer = require("http").createServer(app);

  server.installSubscriptionHandlers(httpServer);

  httpServer.listen(require("./config").port);
};
