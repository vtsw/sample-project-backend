const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./modules');
const createContext = require('./createContext');

const app = express();

createContext().then((context) => {
  app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
    context,
  }));
});

module.exports = app;
