const sinon = require('sinon');
const awilix = require('awilix');
const Authenticator = require('../../../../modules/user/Authenticator');
const UserProvider = require('../../../../modules/user/UserProvider');
const { Mutation } = require('../../../../modules/user/graphql/resolver');

const { createContainer, InjectionMode, asValue } = awilix;
const userMock = require('../user_mock');

describe('createUser', () => {
  let authenticator;
  let container;
  beforeEach(() => {
    container = createContainer({ injectionMode: InjectionMode.CLASSIC });
    authenticator = sinon.createStubInstance(Authenticator, {
      register: sinon.stub(),
    });
    container.register({
      authService: asValue(authenticator),
    });
  });

  afterEach(() => {
    container = null;
    authenticator = null;
  });

  test('Should register user without error.', async () => {
    expect.assertions(1);
    const user = {};
    authenticator.register.resolves(UserProvider.factory(userMock[0]));
    const createdUser = await Mutation.createUser.resolve({}, { user }, { container });
    expect(createdUser).toBeTruthy();
  });

  test('Should return created user.', async () => {
    expect.assertions(1);
    const user = {};
    authenticator.register.resolves(UserProvider.factory(userMock[0]));
    const createdUser = await Mutation.createUser.resolve({}, { user }, { container });
    expect(createdUser).toEqual(UserProvider.factory(userMock[0]));
  });

  test('Should throw error.', async () => {
    expect.assertions(1);
    const user = {};
    authenticator.register.rejects(new Error('fooBar'));
    try {
      await Mutation.createUser.resolve({}, { user }, { container });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should throw error when received email is already exist.', async () => {
    expect.assertions(1);
    const user = {};
    authenticator.register.rejects(new Error('fooBar'));
    try {
      await Mutation.createUser.resolve({}, { user }, { container });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should call authenticator.register with correct params.', async () => {
    expect.assertions(1);
    const user = {
      name: 'Sam',
      email: 'sam@sample.com',
      password: '123',
    };
    authenticator.register.resolves(UserProvider.factory(userMock[0]));
    await Mutation.createUser.resolve({}, { user }, { container });
    expect(authenticator.register).toBeCalledOnceWith(user);
  });
});

describe('login', () => {
  let authenticator;
  let container;
  beforeEach(() => {
    container = createContainer({ injectionMode: InjectionMode.CLASSIC });
    authenticator = sinon.createStubInstance(Authenticator, {
      login: sinon.stub(),
    });
    container.register({
      authService: asValue(authenticator),
    });
  });

  afterEach(() => {
    container = null;
    authenticator = null;
  });

  test('Should login without error.', async () => {
    expect.assertions(1);
    const user = {
      email: 'sam@sample.com',
      password: '123',
    };
    authenticator.login.resolves({
      user: UserProvider.factory(userMock[0]),
      token: 'foobarToken',
    });
    const createdUser = await Mutation.login.resolve({}, { user }, { container });
    expect(createdUser).toBeTruthy();
  });

  test('Should return both logged user and token.', async () => {
    expect.assertions(1);
    const user = {
      email: 'sam@sample.com',
      password: '123',
    };
    authenticator.login.resolves({
      user: UserProvider.factory(userMock[0]),
      token: 'foobarToken',
    });
    const createdUser = await Mutation.login.resolve({}, { user }, { container });
    expect(createdUser).toEqual({
      user: UserProvider.factory(userMock[0]),
      token: 'foobarToken',
    });
  });

  test('Should throw error.', async () => {
    expect.assertions(1);
    const user = {};
    authenticator.login.rejects(new Error('fooBar'));
    try {
      await Mutation.login.resolve({}, { user }, { container });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should call authenticator.login with correct params.', async () => {
    expect.assertions(1);
    const user = {
      email: 'sam@sample.com',
      password: '123',
    };
    authenticator.login.resolves(UserProvider.factory(userMock[0]));
    await Mutation.login.resolve({}, { user }, { container });
    expect(authenticator.login).toBeCalledOnceWith('sam@sample.com', '123');
  });
});

describe('updateUser', () => {
  let authenticator;
  let userProvider;
  let container;
  beforeEach(() => {
    container = createContainer({ injectionMode: InjectionMode.CLASSIC });
    authenticator = sinon.createStubInstance(Authenticator, {
      createPassword: sinon.stub(),
    });
    userProvider = sinon.createStubInstance(UserProvider, {
      update: sinon.stub(),
    });
    container.register({
      authService: asValue(authenticator),
      userProvider: asValue(userProvider),
    });
  });

  afterEach(() => {
    container = null;
    authenticator = null;
    userProvider = null;
  });

  test('Should update user without error.', async () => {
    expect.assertions(1);
    userProvider.update.resolves(UserProvider.factory(userMock[0]));
    authenticator.createPassword.resolves('hashedPassword');
    const updatedUser = await Mutation.updateUser.resolve({}, { user: { password: 'fooBar' } }, { container });
    expect(updatedUser).toBeTruthy();
  });

  test('Should return updated user.', async () => {
    expect.assertions(1);
    userProvider.update.resolves(UserProvider.factory(userMock[0]));
    authenticator.createPassword.resolves('hashedPassword');
    const createdUser = await Mutation.updateUser.resolve({}, { user: { password: 'fooBar' } }, { container });
    expect(createdUser).toEqual(UserProvider.factory(userMock[0]));
  });

  test('Should throw error when hashing password is fail.', async () => {
    expect.assertions(1);
    authenticator.createPassword.rejects(new Error('fooBar'));
    try {
      await Mutation.updateUser.resolve({}, { user: { password: 'foobar' } }, { container });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should throw error when updating password is fail.', async () => {
    expect.assertions(1);
    authenticator.createPassword.resolves('hashedPassword');
    userProvider.update.rejects(new Error('fooBar'));
    try {
      await Mutation.updateUser.resolve({}, { user: { password: 'foobar' } }, { container });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should call authenticator.createPassword with correct params.', async () => {
    expect.assertions(1);
    const user = {
      password: '123',
    };
    authenticator.createPassword.resolves('hashedPassword');
    userProvider.update.resolves(UserProvider.factory(userMock[0]));
    await Mutation.updateUser.resolve({}, { user }, { container });
    expect(authenticator.createPassword).toBeCalledOnceWith('123');
  });

  test('Should call userProvider.update with correct params.', async () => {
    expect.assertions(1);
    const user = {
      id: 'foobarID',
      password: '123',
      name: 'sam',
      email: 'same@sample.com',
    };
    authenticator.createPassword.resolves('hashedPassword');
    userProvider.update.resolves(UserProvider.factory(userMock[0]));
    await Mutation.updateUser.resolve({}, { user }, { container });
    expect(userProvider.update).toBeCalledOnceWith('foobarID', {
      id: 'foobarID',
      password: 'hashedPassword',
      name: 'sam',
      email: 'same@sample.com',
    });
  });
});


describe('deleteUser', () => {
  let userProvider;
  let container;
  beforeEach(() => {
    container = createContainer({ injectionMode: InjectionMode.CLASSIC });
    userProvider = sinon.createStubInstance(UserProvider, {
      delete: sinon.stub(),
    });
    container.register({
      userProvider: asValue(userProvider),
    });
  });

  afterEach(() => {
    userProvider = null;
    container = null;
  });

  test('Should update message without error.', async () => {
    expect.assertions(1);
    userProvider.delete.resolves(UserProvider.factory(userMock[0]));
    const deletedMessage = await Mutation.deleteUser({}, { id: 'foobar' }, { container });
    expect(deletedMessage).toBeTruthy();
  });

  test('Should return deleted user.', async () => {
    expect.assertions(1);
    userProvider.delete.resolves(UserProvider.factory(userMock[0]));
    const deletedMessage = await Mutation.deleteUser({}, { id: 'foobar' }, { container });
    expect(deletedMessage).toEqual(UserProvider.factory(userMock[0]));
  });

  test('Should throw error.', async () => {
    expect.assertions(1);
    userProvider.delete.rejects(new Error('fooBar'));
    try {
      await Mutation.deleteUser({}, { id: 'foobar' }, { container });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should call userProvider.delete with correct params.', async () => {
    expect.assertions(1);
    userProvider.delete.resolves(UserProvider.factory(userMock[0]));
    await Mutation.deleteUser({}, { id: 'foobar' }, { container });
    expect(userProvider.delete).toBeCalledOnceWith('foobar');
  });
});
