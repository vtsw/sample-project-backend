/* eslint-disable no-console */
const path = require('path');

global.APP_ROOT = path.resolve(__dirname);

const cluster = require('cluster');
const os = require('os');
const createApp = require('./app');
const config = require('./config');
const bootstrapper = require('./bootstrapper');

function runApp() {
  bootstrapper().then((container) => {
    createApp(container).listen(config.app.port, () => {
      console.log(`Running a GraphQL API server at ${config.app.host}:${config.app.port}/graphql`);
    });
  });
}

if (config.app.env === 'production') {
  if (cluster.isMaster) {
    os.cpus().forEach(cluster.fork);
  } else if (cluster.isWorker) {
    runApp();
  }
} else {
  runApp();
}
