const sinon = require('sinon');
const { Query } = require('../../../../modules/message/graphql/resolver');
const MessageProvider = require('../../../../modules/message/MessageProvider');

const messageMock = require('../../message/message_mock');

describe('Query', () => {
  describe('message', () => {
    let messageProvider;
    beforeEach(() => {
      messageProvider = sinon.createStubInstance(MessageProvider, {
        findById: sinon.stub(),
      });
    });

    test('Should return messages without error', async () => {
      expect.assertions(1);
      messageProvider.findById.resolves(MessageProvider.factory(messageMock[0]));
      const message = await Query.message({}, {
        id: 'foo',
      }, {
        messageProvider,
      });
      expect(message).toBeTruthy();
    });

    test('Should find message by id', async () => {
      expect.assertions(1);
      messageProvider.findById.resolves(MessageProvider.factory(messageMock[0]));
      await Query.message({}, {
        id: 'foo',
      }, {
        messageProvider,
      });
      expect(messageProvider.findById).toBeCalledOnceWith('foo');
    });
    test('Should throw error', async () => {
      expect.assertions(1);
      messageProvider.findById.rejects(new Error('fooBar'));
      try {
        await Query.message({}, {
          id: 'foo',
        }, {
          messageProvider,
        });
      } catch (e) {
        expect(e).toEqual(new Error('fooBar'));
      }
    });
  });

  describe('messageList', () => {
    let messageProvider;
    beforeEach(() => {
      messageProvider = sinon.createStubInstance(MessageProvider, {
        find: sinon.stub(),
      });
      messageProvider.find.resolves({
        hasNext: true,
        total: 5,
        items: messageMock,
      });
    });
    test('Should return list of messages without error', async () => {
      expect.assertions(1);
      const messages = await Query.messageList({}, {}, {
        messageProvider,
      });
      expect(messages).toBeTruthy();
    });

    test('Should return list of users', async () => {
      expect.assertions(3);
      const {
        hasNext,
        items,
        total,
      } = await Query.messageList({}, {}, {
        messageProvider,
      });
      expect(hasNext).toEqual(true);
      expect(total).toEqual(5);
      expect(items).toEqual(messageMock);
    });

    test('Should message default query condition', async () => {
      expect.assertions(1);
      await Query.messageList({}, {}, {
        messageProvider,
      });
      expect(messageProvider.find).toBeCalledOnceWith({ query: { }, page: { limit: 10, skip: 0 } });
    });

    test('Should query with searchtext param', async () => {
      expect.assertions(1);
      await Query.messageList({}, { query: { searchText: 'foobar', limit: 10, skip: 0 } }, {
        messageProvider,
      });
      expect(messageProvider.find).toBeCalledOnceWith({
        query: { content: new RegExp('foobar') },
        page: { limit: 10, skip: 0 },
      });
    });

    test('Should throw error', async () => {
      expect.assertions(1);
      messageProvider.find.rejects(new Error('fooBar'));
      try {
        await Query.messageList({}, {}, {
          messageProvider,
        });
      } catch (e) {
        expect(e).toEqual(new Error('fooBar'));
      }
    });
  });
});
