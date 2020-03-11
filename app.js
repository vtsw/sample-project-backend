const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const config = require('./config');
const schema = require('./modules');
const bootstrapper = require('./bootstrapper');
const createSessionContext = require('./createSessionContext');

const app = express();
app.use(cors());

bootstrapper().then((appContenxt) => {
  app.use('/graphql', graphqlHTTP(async (req) => {
    // create new context on every request
    const context = await createSessionContext(req, appContenxt);
    return {
      schema,
      graphiql: config.app.mode === 'development',
      context,
    };
  }));
});

module.exports = app;
