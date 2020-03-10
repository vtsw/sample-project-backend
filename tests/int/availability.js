const gql = require('graphql-tag');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const fetch = require("node-fetch");
jest.mock('node-fetch', ()=>jest.fn())

const httpLink =  createHttpLink({
  uri: 'http://localhost:4000/graphql',
  fetch
});
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  }})

const TEST_QUERY = gql`
{
  query userList {
    users
  }
}
`;
console.log(authLink)
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});
describe('Test availability', () => {
  it("Should query users", () => {
    client
      .query({
        query: TEST_QUERY
      })
      .then(
        result =>
        {console.log(result);})
      .catch(error => console.log(error))
  })
});
