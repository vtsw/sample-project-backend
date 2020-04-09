const sinon = require('sinon');
const config = require('../../../config');
const AuthenticationError = require('../../../modules/errors/AuthenticationError');
const Authenticator = require('../../../modules/user/Authenticator');
const UserProvider = require('../../../modules/user/UserProvider');
const User = require('../../../modules/user/User');
const Bcrypt = require('../../../services/bcrypt');
const JWT = require('../../../services/jwt');

const mockUser = require('./user_mock');

// eslint-disable-next-line max-len
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNjg5OTVmYjZkMGJjMDU4MjliNmU3OSIsIm5hbWUiOiI5MDQxMiIsImVtYWlsIjoic3RldmVAZXhhbXBsZS5jb20iLCJpYXQiOjE1ODYzMTk1OTl9.5LXj9f3GILhr36g328XBRVy9kki3DuR-_30_lzIS5rE';

describe('Authenticator', () => {
  let authenticator;
  let userProviderStub;
  let bcrypt;
  let jwt;
  beforeEach(() => {
    userProviderStub = sinon.createStubInstance(UserProvider, {
      findByEmail: sinon.stub(),
      create: sinon.stub(),
    });
    bcrypt = new Bcrypt(config);
    jwt = new JWT(config);
    authenticator = new Authenticator(bcrypt, userProviderStub, jwt);
  });

  afterEach(() => {
    userProviderStub = null;
    bcrypt = null;
    jwt = null;
  });

  describe('#login', () => {
    test('Should login without error', async () => {
      expect.assertions(2);
      userProviderStub.findByEmail.resolves(UserProvider.factory(mockUser));
      const { token, user } = await authenticator.login('steve@example.com', '1234');
      expect(token).toBeTruthy();
      expect(user).toBeTruthy();
    });

    test('Should find user by email correctly.', async () => {
      expect.assertions(1);
      userProviderStub.findByEmail.resolves(UserProvider.factory(mockUser));
      await authenticator.login('steve@example.com', '1234');
      expect(userProviderStub.findByEmail).toHaveBeenCalledWith('steve@example.com');
    });

    test('Should throw error when received email is invalid.', async () => {
      userProviderStub.findByEmail.resolves(null);
      expect.assertions(1);
      try {
        await authenticator.login('invalid@email.com', '1234');
      } catch (e) {
        expect(e)
          .toEqual(new AuthenticationError('User or password is invalid.'));
      }
    });

    test('Should throw error when received password is invalid.', async () => {
      userProviderStub.findByEmail.resolves(UserProvider.factory(mockUser));
      expect.assertions(1);
      try {
        await authenticator.login('steve@example.com', 'invalidPassword');
      } catch (e) {
        expect(e)
          .toEqual(new AuthenticationError('User or password is invalid.'));
      }
    });

    test('Should return encode logged user.', async () => {
      expect.assertions(1);
      userProviderStub.findByEmail.resolves(UserProvider.factory(mockUser));
      const { token } = await authenticator.login('steve@example.com', '1234');
      const { id, name, email } = jwt.decode(token);
      expect({
        id, name, email,
      }).toEqual({
        id: '5e68995fb6d0bc05829b6e79',
        name: '90412',
        email: 'steve@example.com',
      });
    });
  });

  describe('#verify', () => {
    test('Should verify without error.', async () => {
      expect.assertions(1);
      // eslint-disable-next-line max-len
      const user = await authenticator.verify(mockToken);
      expect(user).toBeTruthy();
    });

    test('Should return instance of User.', async () => {
      expect.assertions(1);
      // eslint-disable-next-line max-len
      const user = await authenticator.verify(mockToken);
      expect(user).toBeInstanceOf(User);
    });

    test('Should throw error when received token is invalid.', async () => {
      expect.assertions(1);
      expect(() => {
        authenticator.verify('invalid_token');
      }).toThrow(new AuthenticationError('Invalid token'));
    });
  });

  describe('#register', () => {
    test('Should register without error .', async () => {
      userProviderStub.create.resolves(UserProvider.factory(mockUser));
      const user = {
        password: 'fooBar',
        email: 'foobar@sample.com',
        name: 'johnDoe',
      };
      expect.assertions(1);
      const createdUser = await authenticator.register(user);
      expect(createdUser).toBeTruthy();
    });

    test('Should find user by email correctly.', async () => {
      expect.assertions(1);
      userProviderStub.findByEmail.resolves(null);
      userProviderStub.create.resolves(UserProvider.factory(mockUser));
      const user = {
        password: 'fooBar',
        email: 'foobar@sample.com',
        name: 'johnDoe',
      };
      await authenticator.register(user);
      expect(userProviderStub.findByEmail).toHaveBeenCalledWith('foobar@sample.com');
    });

    test('Should throw error when email is duplicated.', async () => {
      expect.assertions(1);
      userProviderStub.findByEmail.resolves(UserProvider.factory(mockUser));
      const user = {
        password: 'fooBar',
        email: 'duplocatedEmail@sample.com',
        name: 'johnDoe',
      };
      try {
        await authenticator.register(user);
      } catch (e) {
        expect(e).toEqual(new AuthenticationError('The email already exists.'));
      }
    });
  });
});
