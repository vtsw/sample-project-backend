const express = require('express');
const get = require('lodash.get');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
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
    context: async ({ req, connection = {} }) => ({
      container,
      req,
      subContext: connection.context,
    }),
    subscriptions: {
      onConnect: (connectionParams) => {
        const token = get(connectionParams, 'Authorization', '').replace('Bearer ', '');
        if (!token) {
          throw new Error('You must supply a JWT for authorization!');
        }
        const authService = container.resolve('authService');
        return {
          loggedUser: authService.verify(token),
        };
      },
    },
    debug: true,
  });
  graphQlServer.applyMiddleware({ app });

  return { app, graphQlServer };
};
