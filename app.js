const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { scopePerRequest } = require('awilix-express');
const graphqlHTTP = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');

const schema = require('./modules');
const router = require('./http/router');

/**
 *
 * @param container
 * @returns {{app: (*|Express), graphQlServer: ApolloServer}}
 */
module.exports = (container) => {
  const config = container.resolve('config');
  const app = express();
  app.use(bodyParser.json());
  app.use(scopePerRequest(container));
  app.use(cors());
  app.use('/api', router);
  app.use('/graphql', graphqlUploadExpress(config.graphqlUploadExpress), graphqlHTTP((req) => {
    console.log('xxxxxxx');
    return {
      schema,
      graphiql: config.app.env === 'development',
      context: { container: req.container, req }, // bind http request context to graphQl context
    };
  }));

  // const graphQlServer = new ApolloServer({
  //   schema,
  //   context: async ({ req, connection = {} }) => ({
  //     container,
  //     req,
  //     subContext: connection.context,
  //   }),
  //   subscriptions: {
  //     onConnect: (connectionParams) => {
  //       const token = get(connectionParams, 'Authorization', '').replace('Bearer ', '');
  //       if (!token) {
  //         throw new Error('You must supply a JWT for authorization!');
  //       }
  //       const authService = container.resolve('authService');
  //       return {
  //         loggedUser: authService.verify(token),
  //       };
  //     },
  //   },
  //   debug: true,
  // });
  // graphQlServer.applyMiddleware({ app });

  return app;
};
