const express = require('express');
const DataLoader = require('dataloader');
const { ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const { scopePerRequest } = require('awilix-express');
const graphqlHTTP = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');
const expressPlayground = require('graphql-playground-middleware-express').default;

const schema = require('./modules');
const { path, router } = require('./http');

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
  app.use(path.HTTP_API_ROOT, router);
  app.use('/graphql', graphqlUploadExpress(config.graphqlUploadExpress), graphqlHTTP((req) => ({
    schema,
    graphiql: config.app.env === 'development',
    context: {
      container: req.container,
      req,
      dataloader: {
        getUserByIdList: new DataLoader(
          async (ids) => {
            const users = await container.resolve('userProvider').findByIds({ query: { _id: { $in: ids.map((id) => ObjectId(id)) } } })
            const mapped = ids.map((key) => users.find((user) => {
              return user.id == key;
            }));
            return mapped;
          },
        ),
      },
    }, // bind http request context to graphQl context
  })));
  app.get('/playground', expressPlayground({ endpoint: `${config.app.host}:${config.app.port}/graphql` }));
  return app;
};
