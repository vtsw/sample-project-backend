/* eslint-disable no-console */
const path = require('path');
require('dotenv').config();

global.APP_ROOT = path.resolve(__dirname);

const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const https = require('https');
const createApp = require('./app');
const config = require('./config');
const bootstrapper = require('./bootstrapper');

async function runApp() {
  const container = await bootstrapper();
  const { graphQlServer, app } = createApp(container);
  const privateKey = fs.readFileSync('./sslcert/server.key', 'utf8');
  const certificate = fs.readFileSync('./sslcert/server.crt', 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);
  graphQlServer.installSubscriptionHandlers(httpsServer);
  httpsServer.listen(config.app.port, () => {
    console.log(`Running a GraphQL API server at ${config.app.host}:${config.app.port}/graphql`);
    console.log(`Subscriptions ready at ws://${config.app.host}:${config.app.port}${graphQlServer.subscriptionsPath}`);
  });
}

if (config.app.env === 'production') {
  if (cluster.isMaster) {
    os.cpus().forEach(cluster.fork);
  } else if (cluster.isWorker) {
    runApp().catch(console.error);
  }
} else {
  runApp().catch(console.error);
}
