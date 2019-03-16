const path = require("path");
const {
  fileLoader,
  mergeResolvers,
  mergeTypes
} = require("merge-graphql-schemas");

const typeDefs = mergeTypes(
  fileLoader(path.join(__dirname, "../schema/**.graphql"))
);

const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "../resolvers/**.js"))
);

setTimeout(() => {
  console.log(" *** THE SCHEMA HAS BEEN LOADED. ***");
}, 300);

module.exports = {
  typeDefs,
  resolvers
};
