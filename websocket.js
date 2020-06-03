const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const get = require('lodash.get');
const schema = require('./modules');

module.exports = (server, container) => SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: (connectionParams) =>
    // const token = get(connectionParams, 'Authorization', '').replace('Bearer ', '');
    // if (!token) {
    //   throw new Error('You must supply a JWT for authorization!');
    // }
    // const authService = container.resolve('authService');
    // const loggedUser = authService.verify(token);
      ({
        // loggedUser,
        container,
      }),
    onOperation: (message, connection) => ({ ...connection, message }),
  },
  {
    server,
    path: '/graphql',
  },
);
