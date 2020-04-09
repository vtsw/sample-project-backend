const { MongoClient, ObjectId } = require('mongodb');
const MessageProvider = require('../../../modules/message/MessageProvider');
const { ResourceNotFoundError } = require('../../../modules/errors');
const Message = require('../../../modules/message/Message');

const messageMock = require('./message_mock');

jest.mock('moment', () => () => ({ format: () => '2020-03-11T07:55:13+00:00' }));

describe('MessageProvider', () => {
  let connection;
  let db;
  let messageProvider;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db();
  });

  afterAll(async () => {
    await db.collection('messages').drop();
    await connection.close();
    await db.close();
  });


  describe('#findById', () => {
    beforeEach(async () => {
      const messages = db.collection('messages');
      const cloned = JSON.parse(JSON.stringify(messageMock));
      await messages.insertMany(cloned.map((message) => {
        // eslint-disable-next-line no-param-reassign
        message._id = ObjectId(message._id);
        // eslint-disable-next-line no-param-reassign
        message.userId = ObjectId(message.userId);
        return message;
      }));
      messageProvider = new MessageProvider(messages);
    });

    afterEach(async () => {
      await db.collection('messages').drop();
    });

    test('Should return an instance of Message.', async () => {
      const message = await messageProvider.findById(messageMock[0]._id);
      expect(message).toBeInstanceOf(Message);
    });

    test('Should return message.', async () => {
      const message = await messageProvider.findById(messageMock[0]._id);
      expect(message.id).toEqual(messageMock[0]._id);
      expect(message.content).toEqual(messageMock[0].content);
      expect(message.lastModified).toEqual(messageMock[0].lastModified);
      expect(message.userId).toEqual(messageMock[0].userId);
    });

    test('Should return null when requested resource does not exist.', async () => {
      const message = await messageProvider.findById(ObjectId().toString());
      expect(message).toBeNull();
    });

    test('Should throw error when invalid ObjectId is passed.', () => {
      const invalidObjectId = 'invalidObjectId';
      expect(() => {
        messageProvider.findById(invalidObjectId);
      }).toThrow();
    });
  });

  describe('#create', () => {
    beforeEach(async () => {
      const messages = db.collection('messages');
      messageProvider = new MessageProvider(messages);
    });

    afterEach(async () => {
      await db.collection('messages').drop();
    });

    test('Should create new message without error', async () => {
      const message = {
        content: 'hello world',
        userId: '5e68995fb6d0bc05829b6e77',
      };
      const insertedMessage = await messageProvider.create(message);
      const foundedMessage = await db.collection('messages').findOne({ _id: ObjectId(insertedMessage.id) });
      expect(foundedMessage).toEqual({
        _id: ObjectId(insertedMessage.id),
        content: message.content,
        userId: ObjectId(message.userId),
        deleted: false,
        lastModified: '2020-03-11T07:55:13+00:00',
      });
    });

    test('Should return created message as instance of Message', async () => {
      const message = {
        content: 'hello world',
        userId: '5e68995fb6d0bc05829b6e77',
      };
      const createdMessage = await messageProvider.create(message);
      expect(createdMessage).toBeInstanceOf(Message);
    });

    test('Should return created message', async () => {
      const message = {
        content: 'hello world',
        userId: '5e68995fb6d0bc05829b6e77',
      };
      const createdMessage = await messageProvider.create(message);
      expect(createdMessage.toJson()).toEqual({
        id: createdMessage.id,
        content: message.content,
        userId: message.userId,
        lastModified: '2020-03-11T07:55:13+00:00',
      });
    });
  });

  describe('#update', () => {
    beforeEach(async () => {
      const messages = db.collection('messages');
      const mockMessage = {
        _id: ObjectId('507f1f77bcf86cd799439011'),
        userId: ObjectId('5e68995fb6d0bc05829b6e77'),
        content: 'hello world',
        lastModified: '2020-03-11T07:55:11+00:00',
        deleted: false,
      };
      await messages.insertOne(mockMessage);
      messageProvider = new MessageProvider(messages);
    });

    afterEach(async () => {
      await db.collection('messages').drop();
    });


    test('Should update message without error', async () => {
      const existedId = '507f1f77bcf86cd799439011';
      const message = {
        content: 'new content',
      };
      await messageProvider.update(existedId, message);
      const foundedMessage = await db.collection('messages').findOne({ _id: ObjectId(existedId) }, { content: true });
      expect(foundedMessage.content).toEqual(message.content);
      expect(foundedMessage._id).toEqual(ObjectId(existedId));
      expect(foundedMessage.lastModified).toEqual('2020-03-11T07:55:13+00:00');
    });

    test('Should return an instance of Message', async () => {
      const existedId = '507f1f77bcf86cd799439011';
      const message = {
        content: 'new content',
      };
      const updatedMessage = await messageProvider.update(existedId, message);
      expect(updatedMessage).toBeInstanceOf(Message);
    });

    test('Should throw error when received message does not exist.', () => {
      const newId = ObjectId();
      const message = {
        content: 'new content',
      };
      expect(
        messageProvider.update(newId, message),
      ).rejects.toEqual(new ResourceNotFoundError('message', `id: ${newId}`));
    });

    test('Should throw error when update fail.', () => {
      const newId = ObjectId();
      const message = {};
      expect(
        messageProvider.update(newId, message),
      ).rejects.toEqual(new ResourceNotFoundError('message', `id: ${newId}`));
    });
  });

  describe('#delete', () => {
    beforeEach(async () => {
      const messages = db.collection('messages');
      const mockMessage = {
        _id: ObjectId('507f1f77bcf86cd799439011'),
        userId: ObjectId('5e68995fb6d0bc05829b6e77'),
        content: 'hello world',
        lastModified: '2020-03-11T07:55:11+00:00',
        deleted: false,
      };
      await messages.insertOne(mockMessage);
      messageProvider = new MessageProvider(messages);
    });

    afterEach(async () => {
      await db.collection('messages').drop();
    });

    test('Should soft-delete message without error.', async () => {
      const existedId = '507f1f77bcf86cd799439011';
      await messageProvider.delete(existedId);
      const foundedMessage = await db.collection('messages').findOne({ _id: ObjectId(existedId) });
      expect(foundedMessage.deleted).toEqual(true);
    });

    test('Deleting and re-fetching.', async () => {
      const existedId = '507f1f77bcf86cd799439011';
      const message = await messageProvider.findById(existedId);
      await messageProvider.delete(existedId);
      const deletedMessage = await messageProvider.findById(existedId);
      expect(message).toBeInstanceOf(Message);
      expect(deletedMessage).toEqual(null);
    });

    test('Should throw error when received message does not exist.', () => {
      const newId = ObjectId();
      expect(
        messageProvider.delete(newId),
      ).rejects.toEqual(new ResourceNotFoundError('message', `id: ${newId}`));
    });
  });

  describe('#find', () => {
    beforeEach(async () => {
      const messages = db.collection('messages');
      const cloned = JSON.parse(JSON.stringify(messageMock));
      await messages.insertMany(cloned.map((message) => {
        // eslint-disable-next-line no-param-reassign
        message._id = ObjectId(message._id);
        // eslint-disable-next-line no-param-reassign
        message.userId = ObjectId(message.userId);
        return message;
      }));
      messageProvider = new MessageProvider(messages);
    });

    afterEach(async () => {
      messageProvider = null;
      db.collection('messages').drop();
    });

    test('Should return an array of all messages', async () => {
      const result = await messageProvider.find();
      expect(result.total).toEqual(10);
    });

    test('Should return result with hasNext', async () => {
      const result = await messageProvider.find({ page: { limit: 5, skip: 0 }, query: {} });
      expect(result.hasNext).toEqual(true);
    });
  });
});
