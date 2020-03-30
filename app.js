const express = require('express');
const graphqlHTTP = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');
const cors = require('cors');
const config = require('./config');
const schema = require('./modules');
const createSessionContext = require('./createSessionContext');
const router = require('./http/router');

const app = express();
app.use(cors());

app.use('/api', router);
app.use('/graphql', graphqlUploadExpress(config.graphqlUploadExpress), graphqlHTTP(async (req) => {
  // create new context on every request
  const context = await createSessionContext(req, req.app.appContenxt);
  return {
    schema,
    graphiql: config.app.env === 'development',
    context,
  };
}));

module.exports = app;
