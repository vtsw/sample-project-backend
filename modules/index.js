const { makeExecutableSchema } = require('graphql-tools');
const { applyMiddleware } = require('graphql-middleware');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolver');
const directiveResolvers = require('./directiveResolvers');
const { validation, logging, errorHandler } = require('./middlewares');


module.exports = applyMiddleware(makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
}),
errorHandler, logging, validation);
