const { MongoClient, ObjectId } = require('mongodb');
const MessageProvider = require('../../../modules/message/MessageProvider');
const Message = require('../../../modules/message/Message');

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
    await connection.close();
    await db.close();
  });

  beforeEach(async () => {
    const messages = db.collection('messages');
    const mockUser = {
      _id: ObjectId('507f1f77bcf86cd799439011'),
      sender: ObjectId('5e68995fb6d0bc05829b6e77'),
      content: 'hello world',
      lastModified: '2020-03-11T07:55:13+00:00',
      deleted: false,
    };
    await messages.insertOne(mockUser);
    messageProvider = new MessageProvider(messages);
  });

  afterEach(async () => {
    await db.collection('messages').deleteMany({});
  });

  describe('#findById', () => {
    test('Should return an instance of Message.', async () => {
      const message = await messageProvider.findById('507f1f77bcf86cd799439011');
      expect(message).toBeInstanceOf(Message);
    });

    test('Should return message.', async () => {
      const message = await messageProvider.findById('507f1f77bcf86cd799439011');
      expect(message.toJson()).toEqual({
        id: '507f1f77bcf86cd799439011',
        content: 'hello world',
        lastModified: '2020-03-11T07:55:13+00:00',
        sender: '5e68995fb6d0bc05829b6e77',
      });
    });

    test('Should return null when requested resource is not exist.', async () => {
      const notExistId = ObjectId().toString();
      const message = await messageProvider.findById(notExistId);
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
    test('Should create new message without error', async () => {
      const message = {
        content: 'hello world',
        sender: '5e68995fb6d0bc05829b6e77',
      };
      const insertedMessage = await messageProvider.create(message);
      const foundedMessage = await db.collection('messages').findOne({ _id: ObjectId(insertedMessage.id) });
      expect(foundedMessage).toEqual({
        _id: ObjectId(insertedMessage.id),
        content: message.content,
        sender: ObjectId(message.sender),
        deleted: false,
        lastModified: '2020-03-11T07:55:13+00:00',
      });
    });

    test('Should return created message as instance of Message', async () => {
      const message = {
        content: 'hello world',
        sender: '5e68995fb6d0bc05829b6e77',
      };
      const createdMessage = await messageProvider.create(message);
      expect(createdMessage).toBeInstanceOf(Message);
    });

    test('Should return created message', async () => {
      const message = {
        content: 'hello world',
        sender: '5e68995fb6d0bc05829b6e77',
      };
      const createdMessage = await messageProvider.create(message);
      expect(createdMessage.toJson()).toEqual({
        id: createdMessage.id,
        content: message.content,
        sender: message.sender,
        lastModified: '2020-03-11T07:55:13+00:00',
      });
    });
  });

  // describe('#update', () => {
  //   beforeEach(() => {
  //     jest.mock('moment', () => () => ({ format: () => '2020-04-01T07:55:13+00:00' }));
  //   });
  //
  //   test('Should update message without error', async () => {
  //     const existedId = '507f1f77bcf86cd799439011';
  //     const message = {
  //       content: 'new content',
  //     };
  //     await messageProvider.update(existedId, message);
  //     const foundedMessage = await db.collection('messages').findOne({ _id: ObjectId(existedId) }, { content: true });
  //     expect(foundedMessage.content).toEqual(message.content);
  //     expect(foundedMessage._id).toEqual(ObjectId(existedId));
  //     expect(foundedMessage.lastModified).toEqual('2020-04-01T07:55:13+00:00');
  //   });
  // });
});
