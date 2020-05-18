const { makeExecutableSchema } = require('graphql-tools');
const { applyMiddleware } = require('graphql-middleware');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolver');
const directiveResolvers = require('./directiveResolvers');
const { validation, logging, errorHandler } = require('./middlewares');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
}),
errorHandler, logging, validation);


const middlewaresToApply = config.middlewares.map((mwName) => middlewares[mwName])

const applyMiddlewareToApp = applyMiddleware(schema,
  ...middlewaresToApply);
module.exports = applyMiddlewareToApp;
