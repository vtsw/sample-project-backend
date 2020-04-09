const { makeExecutableSchema } = require('graphql-tools');
const { applyMiddleware } = require('graphql-middleware');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolver');
const directiveResolvers = require('./directiveResolvers');
const config = require('../config')
const middlewares = require('./middlewares');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
});


const middlewaresToApply = config.middlewares.map((mwName) => middlewares[mwName])

const applyMiddlewareToApp = applyMiddleware(schema,
  ...middlewaresToApply);
module.exports = applyMiddlewareToApp;
