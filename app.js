const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./modules');
const bootstrapper = require('./bootstrapper');
const createSessionContext = require('./createSessionContext');

const app = express();

bootstrapper().then((appContenxt) => {
  app.use('/graphql', graphqlHTTP(async (req) => {
    // create new context on every request
    const context = await createSessionContext(req, appContenxt);
    return {
      schema,
      graphiql: true,
      context,
    };
  }));
});

module.exports = app;
