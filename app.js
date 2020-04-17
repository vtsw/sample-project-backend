const express = require('express');
const graphqlHTTP = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');
const cors = require('cors');
const { scopePerRequest } = require('awilix-express');
const config = require('./config');
const schema = require('./modules');
const router = require('./http/router');

/**
 *
 * @param container
 * @returns {app}
 */
module.exports = (container) => {
  const app = express();
  app.use(scopePerRequest(container));
  app.use(cors());
  app.use('/api', router);
  app.use('/graphql', graphqlUploadExpress(config.graphqlUploadExpress), graphqlHTTP((req) => ({
    schema,
    graphiql: config.app.env === 'development',
    context: { container: req.container, req }, // bind http request context to graphQl context
  })));

  return app;
};
