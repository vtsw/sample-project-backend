const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { scopePerRequest } = require('awilix-express');
const graphqlHTTP = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');
const expressPlayground = require('graphql-playground-middleware-express').default;

const schema = require('./modules');
const router = require('./http/router');
const dataloader = require('./modules/dataloader');

/**
 *
 * @param container
 * @returns {*|Express}
 */
module.exports = (container) => {
  const config = container.resolve('config');
  const app = express();
  app.use(bodyParser.json());
  app.use(scopePerRequest(container));
  app.use(cors());
  app.use((req, res, next) => {
    req.errors = [];
    next();
  });
  app.use('/api', router);
  app.use('/graphql', graphqlUploadExpress(config.graphqlUploadExpress), graphqlHTTP((req) => ({
    schema,
    graphiql: config.app.env === 'development',
    context: { container: req.container, req, dataloader: dataloader(container) }, // bind http request context to graphQl context
    // eslint-disable-next-line consistent-return
    extensions: ({ context }) => {
      if (context.req.errors[0]) {
        return {
          errors: context.req.errors.map((e) => ({
            message: e.toString(),
            stacktrace: e.stack,
          })),
        };
      }
    },
  })));
  app.get('/playground', expressPlayground({ endpoint: `${config.app.host}:${config.app.port}/graphql` }));
  return app;
};
