const serverConfig = require('../../config');
const ApolloClient = require('apollo-boost');
const gql = ApolloClient.gql;
const serverPort = serverConfig.app.port;

const TEST_QUERY = gql`
{
  userList {
    users
  }
}
`;

const client = new ApolloClient({
  uri: `https://web:${serverPort}`,
});

client
  .query({
    query: TEST_QUERY
  })
  .then(result => console.log(result));
