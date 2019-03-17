const { PubSub, withFilter } = require("apollo-server-express");

const tags = require("./tags");

const pubsub = new PubSub();
module.exports = {
  withFilter,
  tags,
  pubsub
};
