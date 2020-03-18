const { ApolloLink } = require('apollo-link');

const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const fetch = require('node-fetch');
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  fetch,
});
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
  },
}));

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

const clientFactory = function clientFactory(token) {
  const authedLink = new ApolloLink((operation, forward) => {
    // Use the setContext method to set the HTTP headers.
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    });

    // Call the next link in the middleware chain.
    return forward(operation);
  });
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authedLink.concat(httpLink),
  });
};

module.exports = {
  client,
  clientFactory
};
