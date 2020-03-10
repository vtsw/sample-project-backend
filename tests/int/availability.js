const gql = require('graphql-tag');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const assert = require('assert').strict;
const fetch = require('node-fetch');

const httpLink = createHttpLink({
  uri: 'http://web:4000/graphql',
  fetch,
});
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
  },
}));

const TEST_QUERY = gql`
{
  foo
}
`;
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});
describe('Test availability', () => {
  it('Should query users', async () => {
    expect.assertions(1);
    const result = await client
      .query({
        query: TEST_QUERY,
      });
    console.log(result, 'result');

    expect(result.data).toStrictEqual({
      foo: 'Bar',
    });
  });
});
