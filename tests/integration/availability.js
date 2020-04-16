const gql = require('graphql-tag');
const { client } = require('./client');

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
