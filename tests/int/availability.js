const gql = require('graphql-tag');
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

const TEST_QUERY = gql`
  {
    hello
  }
`;
const TEST_MUTATION = gql`
    mutation {
        hello(name: "Sam")
    }
`;
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});
describe('Test availability', () => {
  it('Should query hello', async () => {
    expect.assertions(1);
    const result = await client
      .query({
        query: TEST_QUERY,
      });
    expect(result.data).toStrictEqual({
      hello: 'world',
    });
  });

  it('should mutate hello', async () => {
    expect.assertions(1);
    const result = await client
      .mutate({
        mutation: TEST_MUTATION,
      });
    expect(result.data).toStrictEqual({
      hello: 'hello Sam',
    });
  });
});
