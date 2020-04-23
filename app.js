const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const cors = require('cors');
const { scopePerRequest } = require('awilix-express');
const schema = require('./modules');
const router = require('./http/router');

/**
 *
 * @param container
 * @returns {{app: (*|Express), graphQlServer: ApolloServer}}
 */
module.exports = (container) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(scopePerRequest(container));
  app.use(cors());
  app.use('/api', router);
  const graphQlServer = new ApolloServer({
    schema,
    context: ({ req }) => ({
      container,
      req,
    }),
    debug: true,
  });
  graphQlServer.applyMiddleware({ app });

  return { app, graphQlServer };
};
