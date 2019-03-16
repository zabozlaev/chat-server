const { PubSub, withFilter } = require("apollo-server-express");

module.exports = {
  pubsub: new PubSub(),
  withFilter
};
