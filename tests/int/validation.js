var uuid = require('uuid');
const gql = require('graphql-tag');
const { client, clientFactory } = require('./client');

const LOGIN = gql`
	mutation Login($user: LoginUserInput!) {
		login(user: $user) {
			token
		}
	}
`;

const CREATE_USER = gql`
  mutation CreateUser($user: CreateUserInput!) {
    createUser(user: $user) {
      id,
      name,
      email,
      lastModified,
    }
  }
`;

const defaultUser = {
  email: 'steve@example.com',
  password: '123'
};

const validUser = {
  email: uuid.v4() + `@whereiam.com`,
  name: 'iamme',
  password: 'idontknow'
};

const invalidUser = {
  email: uuid.v4() + `@whereiam.com`,
  name: 'iamme',
  password: '1'
};

describe('Test validation', () => {
  var loginToken = undefined;
  it('Should return token when login', async () => {
    console.log('Signing in');
    const result = await client.mutate({
      mutation: LOGIN,
      variables: {
        user: defaultUser
      }
    });
    expect(result.data.login.token)
      .toBeDefined();
    loginToken = result.data.login.token;
    console.log('Signing in token: ', result.data.login.token);
  });

  const authedClient = clientFactory(loginToken);
  it('Should return new user when create a valid one', async () => {
    console.log('Creating new user: ', invalidUser, '\nUsing token: ', loginToken);
    const result = await authedClient.mutate({
      mutation: CREATE_USER,
      variables: {
        user: validUser,
        query: {}
      },
    });
    console.log('Added user: ', result);
  });

  it('Should return error when create a invalid one', async () => {
    console.log('Creating new user: ', invalidUser, '\nUsing token: ', loginToken);
    try {
      const result = await authedClient.mutate({
        mutation: CREATE_USER,
        variables: {
          user: invalidUser,
          query: {}
        },
      });
    } catch (e) {
      expect(e.graphQLErrors).toBeDefined()
      console.log(e.graphQLErrors);
    }
  });
});
