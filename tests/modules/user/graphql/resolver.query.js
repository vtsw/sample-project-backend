const sinon = require('sinon');
const { Query, User } = require('../../../../modules/user/graphql/resolver');
const UserProvider = require('../../../../modules/user/UserProvider');
const MessageProvider = require('../../../../modules/message/MessageProvider');

const mockUser = require('../user_mock');
const mockMessage = require('../../message/message_mock');

describe('Query', () => {
  describe('user', () => {
    let userProviderStub;
    beforeEach(() => {
      userProviderStub = sinon.createStubInstance(UserProvider, {
        findById: sinon.stub(),
      });
    });

    test('Should return user without error', async () => {
      expect.assertions(1);
      userProviderStub.findById.resolves(UserProvider.factory(mockUser[0]));
      const user = await Query.user({}, {
        id: 'foo',
      }, {
        userProvider: userProviderStub,
      });
      expect(user).toBeTruthy();
    });

    test('Should find user by id', async () => {
      expect.assertions(1);
      userProviderStub.findById.resolves(UserProvider.factory(mockUser[0]));
      await Query.user({}, {
        id: 'foo',
      }, {
        userProvider: userProviderStub,
      });
      expect(userProviderStub.findById).toBeCalledOnceWith('foo');
    });
    test('Should throw error', async () => {
      expect.assertions(1);
      userProviderStub.findById.rejects(new Error('fooBar'));
      try {
        await Query.user({}, {
          id: 'foo',
        }, {
          userProvider: userProviderStub,
        });
      } catch (e) {
        expect(e).toEqual(new Error('fooBar'));
      }
    });
  });

  describe('me', () => {
    let userProviderStub;
    beforeEach(() => {
      userProviderStub = sinon.createStubInstance(UserProvider, {
        findById: sinon.stub(),
      });
    });

    test('Should return logged without error', async () => {
      expect.assertions(1);
      userProviderStub.findById.resolves(UserProvider.factory(mockUser[0]));
      const user = await Query.me({}, {}, {
        userProvider: userProviderStub,
        req: {
          user: {
            id: 'foobar',
          },
        },
      });
      expect(user).toBeTruthy();
    });

    test('Should find user by id', async () => {
      expect.assertions(1);
      userProviderStub.findById.resolves(UserProvider.factory(mockUser[0]));
      await Query.me({}, {}, {
        userProvider: userProviderStub,
        req: {
          user: {
            id: 'foobar',
          },
        },
      });
      expect(userProviderStub.findById).toBeCalledOnceWith('foobar');
    });
    test('Should throw error', async () => {
      expect.assertions(1);
      userProviderStub.findById.rejects(new Error('fooBar'));
      try {
        await Query.me({}, {}, {
          userProvider: userProviderStub,
          req: {
            user: {
              id: 'foobar',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual(new Error('fooBar'));
      }
    });
  });

  describe('userList', () => {
    let userProviderStub;
    beforeEach(() => {
      userProviderStub = sinon.createStubInstance(UserProvider, {
        find: sinon.stub(),
      });
      userProviderStub.find.resolves({
        hasNext: true,
        total: 5,
        items: mockUser,
      });
    });
    test('Should return list of users without error', async () => {
      expect.assertions(1);
      const user = await Query.userList({}, {}, {
        userProvider: userProviderStub,
      });
      expect(user).toBeTruthy();
    });

    test('Should return list of users', async () => {
      expect.assertions(3);
      const {
        hasNext,
        items,
        total,
      } = await Query.userList({}, {}, {
        userProvider: userProviderStub,
      });
      expect(hasNext).toEqual(true);
      expect(total).toEqual(5);
      expect(items).toEqual(mockUser);
    });

    test('Should use default query condition', async () => {
      expect.assertions(1);
      await Query.userList({}, {}, {
        userProvider: userProviderStub,
      });
      expect(userProviderStub.find).toBeCalledOnceWith({ query: { }, page: { limit: 10, skip: 0 } });
    });

    test('Should query with searchtext param', async () => {
      expect.assertions(1);
      await Query.userList({}, { query: { searchText: 'foobar', limit: 10, skip: 0 } }, {
        userProvider: userProviderStub,
      });
      expect(userProviderStub.find).toBeCalledOnceWith({
        query: { $or: [{ name: new RegExp('foobar') }, { email: new RegExp('foobar') }] },
        page: { limit: 10, skip: 0 },
      });
    });

    test('Should throw error', async () => {
      expect.assertions(1);
      userProviderStub.find.rejects(new Error('fooBar'));
      try {
        await Query.userList({}, {}, {
          userProvider: userProviderStub,
        });
      } catch (e) {
        expect(e).toEqual(new Error('fooBar'));
      }
    });
  });
});

describe('User trivial resolver', () => {
  describe('Message', () => {
    let messageProvider;
    beforeEach(() => {
      messageProvider = sinon.createStubInstance(MessageProvider, {
        find: sinon.stub(),
      });
      messageProvider.find.resolves({
        hasNext: true,
        total: 5,
        items: mockMessage,
      });
    });

    afterEach(() => {
      messageProvider = null;
    });

    test('Should return list of messages without error', async () => {
      expect.assertions(1);
      const messages = await User.messages(mockUser[0], {}, {
        messageProvider,
      });
      expect(messages).toBeTruthy();
    });

    test('Should return list of messages', async () => {
      expect.assertions(3);
      const {
        hasNext,
        items,
        total,
      } = await User.messages(mockUser[0], {}, {
        messageProvider,
      });
      expect(hasNext).toEqual(true);
      expect(total).toEqual(5);
      expect(items).toEqual(mockMessage);
    });

    test('Should find all messages that associated with user', async () => {
      expect.assertions(1);
      await User.messages(mockUser[0], {}, {
        messageProvider,
      });
      expect(messageProvider.find).toBeCalledOnceWith({ query: { userId: mockUser[0].id }, page: { limit: 10, skip: 0 } });
    });

    test('Should find all messages that associated with user and match the condition', async () => {
      expect.assertions(1);
      await User.messages(UserProvider.factory(mockUser[0]), { query: { searchText: 'foobar', limit: 10, skip: 0 } }, {
        messageProvider,
      });
      expect(messageProvider.find).toBeCalledOnceWith({
        query: { userId: mockUser[0]._id, content: new RegExp('foobar') },
        page: { limit: 10, skip: 0 },
      });
    });

    test('Should throw error', async () => {
      expect.assertions(1);
      messageProvider.find.rejects(new Error('fooBar'));
      try {
        await User.messages(mockUser[0], {}, {
          messageProvider,
        });
      } catch (e) {
        expect(e).toEqual(new Error('fooBar'));
      }
    });
  });
});
