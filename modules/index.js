
const { makeExecutableSchema } = require('graphql-tools');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolver');

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
