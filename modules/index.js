const { makeExecutableSchema } = require('graphql-tools');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolver');
const directiveResolvers = require('./directiveResolvers');

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
});
