const sinon = require('sinon');
const { Query } = require('../../../../modules/user/graphql/resolver');
const UserProvider = require('../../../../modules/user/UserProvider');

const mockUser = require('../mock_user');

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
      userProviderStub.findById.resolves(UserProvider.factory(mockUser));
      const user = await Query.user({}, {
        id: 'foo',
      }, {
        userProvider: userProviderStub,
      });
      expect(user).toBeTruthy();
    });

    test('Should find user by id', async () => {
      expect.assertions(1);
      userProviderStub.findById.resolves(UserProvider.factory(mockUser));
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
      userProviderStub.findById.resolves(UserProvider.factory(mockUser));
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
      userProviderStub.findById.resolves(UserProvider.factory(mockUser));
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
        items: [
          UserProvider.factory(mockUser),
          UserProvider.factory(mockUser),
          UserProvider.factory(mockUser),
          UserProvider.factory(mockUser),
          UserProvider.factory(mockUser),
        ],
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
      expect(items).toEqual([
        UserProvider.factory(mockUser),
        UserProvider.factory(mockUser),
        UserProvider.factory(mockUser),
        UserProvider.factory(mockUser),
        UserProvider.factory(mockUser),
      ]);
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
