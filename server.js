/* eslint-disable no-console */
require('dotenv').config();
const app = require('./app');
const config = require('./config');

app.listen(config.app.port, () => {
  console.log(`Running a GraphQL API server at http://localhost:${config.app.port}/graphql`);
});
