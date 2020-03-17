/* eslint-disable no-console */
require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const config = require('./config');
const bootstrapper = require('./bootstrapper');

if (config.app.env === 'production') {
  if (cluster.isMaster) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }
  } else if (cluster.isWorker) {
    bootstrapper().then((appContenxt) => {
      app.appContenxt = appContenxt;
      app.listen(config.app.port, () => {
        console.log(`Running a GraphQL API server at http://localhost:${config.app.port}/graphql`);
      });
    });
  }
} else {
  bootstrapper().then((appContenxt) => {
    app.appContenxt = appContenxt;
    app.listen(config.app.port, () => {
      console.log(`Running a GraphQL API server at http://localhost:${config.app.port}/graphql`);
    });
  });
}
