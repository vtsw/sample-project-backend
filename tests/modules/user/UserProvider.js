const { MongoClient, ObjectId } = require('mongodb');
const UserProvider = require('../../../modules/user/UserProvider');
const User = require('../../../modules/user/User');
const { ResourceNotFoundError } = require('../../../modules/errors');

jest.mock('moment', () => () => ({ format: () => '2020-03-11T07:55:13+00:00' }));

describe('UserProvider', () => {
  let connection;
  let db;
  let userProvider;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db();
  });

  afterAll(async () => {
    await db.collection('users').drop();
    await connection.close();
    await db.close();
  });


  describe('#findById', () => {
    beforeEach(async () => {
      const users = db.collection('users');
      const mockUser = {
        _id: ObjectId('5e68995fb6d0bc05829b6e79'),
        name: '90412',
        email: 'steve@example.com',
        password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
        lastModified: '2020-04-03T09:39:20.350Z',
        deleted: false,
        id: '5e68995fb6d0bc05829b6e79',
        image: {
          filename: 'macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
          hashedFilename: 'c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
          // eslint-disable-next-line max-len
          link: 'http://172.76.10.161:4001/api/download/images/c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590%20(22).jpg',
          etag: 'ef8781f4a83faa611944f57e3aacb3c4-1',
        },
      };
      await users.insertOne(mockUser);
      userProvider = new UserProvider(users);
    });

    afterEach(async () => {
      await db.collection('users').drop();
    });

    test('Should return an instance of User.', async () => {
      const user = await userProvider.findById('5e68995fb6d0bc05829b6e79');
      expect(user).toBeInstanceOf(User);
    });

    test('Should return user.', async () => {
      const user = await userProvider.findById('5e68995fb6d0bc05829b6e79');
      expect(user.id).toEqual('5e68995fb6d0bc05829b6e79');
      expect(user.email).toEqual('steve@example.com');
      expect(user.password).toEqual('$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS');
      expect(user.lastModified).toEqual('2020-04-03T09:39:20.350Z');
      expect(user.name).toEqual('90412');
      expect(user.image).toEqual({
        filename: 'macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
        hashedFilename: 'c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        // eslint-disable-next-line max-len
        link: 'http://172.76.10.161:4001/api/download/images/c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590%20(22).jpg',
        etag: 'ef8781f4a83faa611944f57e3aacb3c4-1',
      });
    });

    test('Should return null when requested user does not exist.', async () => {
      const notExistId = ObjectId().toString();
      const user = await userProvider.findById(notExistId);
      expect(user).toBeNull();
    });

    test('Should throw error when invalid ObjectId is passed.', () => {
      const invalidObjectId = 'invalidObjectId';
      expect(() => {
        userProvider.findById(invalidObjectId);
      }).toThrow();
    });
  });

  describe('#findByEmail', () => {
    beforeEach(async () => {
      const users = db.collection('users');
      const mockUser = {
        _id: ObjectId('5e68995fb6d0bc05829b6e79'),
        name: '90412',
        email: 'steve@example.com',
        password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
        lastModified: '2020-04-03T09:39:20.350Z',
        deleted: false,
        id: '5e68995fb6d0bc05829b6e79',
        image: {
          filename: 'macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
          hashedFilename: 'c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
          // eslint-disable-next-line max-len
          link: 'http://172.76.10.161:4001/api/download/images/c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590%20(22).jpg',
          etag: 'ef8781f4a83faa611944f57e3aacb3c4-1',
        },
      };
      await users.insertOne(mockUser);
      userProvider = new UserProvider(users);
    });

    afterEach(async () => {
      await db.collection('users').drop();
    });

    test('Should return an instance of User.', async () => {
      const user = await userProvider.findByEmail('steve@example.com');
      expect(user).toBeInstanceOf(User);
    });

    test('Should return correctly user.', async () => {
      const user = await userProvider.findByEmail('steve@example.com');
      expect(user.id).toEqual('5e68995fb6d0bc05829b6e79');
      expect(user.email).toEqual('steve@example.com');
      expect(user.password).toEqual('$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS');
      expect(user.lastModified).toEqual('2020-04-03T09:39:20.350Z');
      expect(user.name).toEqual('90412');
      expect(user.image).toEqual({
        filename: 'macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
        hashedFilename: 'c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        // eslint-disable-next-line max-len
        link: 'http://172.76.10.161:4001/api/download/images/c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590%20(22).jpg',
        etag: 'ef8781f4a83faa611944f57e3aacb3c4-1',
      });
    });

    test('Should return null when requested user does not exist.', async () => {
      const notExistEmail = 'sam@sample.com';
      const user = await userProvider.findByEmail(notExistEmail);
      expect(user).toBeNull();
    });
  });

  describe('#create', () => {
    beforeEach(async () => {
      const users = db.collection('users');
      userProvider = new UserProvider(users);
    });

    afterEach(async () => {
      await db.collection('users').drop();
    });
    test('Should create new user without error', async () => {
      const user = {
        name: 'johnDoe',
        email: 'foobar@example.com',
        password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
      };
      const insertedUser = await userProvider.create(user);
      const foundedUser = await db.collection('users').findOne({ _id: ObjectId(insertedUser.id) });
      expect(foundedUser).toEqual({
        _id: ObjectId(insertedUser.id),
        name: user.name,
        email: user.email,
        deleted: false,
        lastModified: '2020-03-11T07:55:13+00:00',
        password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
      });
    });

    test('Should return created user as instance of User', async () => {
      const user = {
        name: 'johnDoe',
        email: 'foobar@example.com',
        password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
      };
      const createdUser = await userProvider.create(user);
      expect(createdUser).toBeInstanceOf(User);
    });
  });

  describe('#update', () => {
    beforeEach(async () => {
      const users = db.collection('users');
      const mockUser = {
        _id: ObjectId('5e68995fb6d0bc05829b6e79'),
        name: '90412',
        email: 'steve@example.com',
        password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
        lastModified: '2020-04-03T09:39:20.350Z',
        deleted: false,
        id: '5e68995fb6d0bc05829b6e79',
        image: {
          filename: 'macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
          hashedFilename: 'c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
          // eslint-disable-next-line max-len
          link: 'http://172.76.10.161:4001/api/download/images/c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590%20(22).jpg',
          etag: 'ef8781f4a83faa611944f57e3aacb3c4-1',
        },
      };
      await users.insertOne(mockUser);
      userProvider = new UserProvider(users);
    });

    afterEach(async () => {
      await db.collection('users').drop();
    });


    test('Should update user without error', async () => {
      const existedId = '5e68995fb6d0bc05829b6e79';
      const user = {
        name: 'new name',
      };
      await userProvider.update(existedId, user);
      const foundedUser = await db.collection('users').findOne({ _id: ObjectId(existedId) });
      expect(foundedUser.name).toEqual(user.name);
      expect(foundedUser._id).toEqual(ObjectId(existedId));
      expect(foundedUser.lastModified).toEqual('2020-03-11T07:55:13+00:00');
    });

    test('Should return an instance of User', async () => {
      const existedId = '5e68995fb6d0bc05829b6e79';
      const user = {
        name: 'new name',
      };
      const updatedUser = await userProvider.update(existedId, user);
      expect(updatedUser).toBeInstanceOf(User);
    });

    test('Should throw error when received user does not exist.', () => {
      const newId = ObjectId();
      const user = {
        name: 'new name',
      };
      expect(
        userProvider.update(newId, user),
      ).rejects.toEqual(new ResourceNotFoundError('User', `id: ${newId}`));
    });
  });

  describe('#delete', () => {
    beforeEach(async () => {
      const users = db.collection('users');
      const mockUser = {
        _id: ObjectId('5e68995fb6d0bc05829b6e79'),
        name: '90412',
        email: 'steve@example.com',
        password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
        lastModified: '2020-04-03T09:39:20.350Z',
        deleted: false,
        id: '5e68995fb6d0bc05829b6e79',
        image: {
          filename: 'macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
          hashedFilename: 'c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590 (22).jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
          // eslint-disable-next-line max-len
          link: 'http://172.76.10.161:4001/api/download/images/c3bf25ec-47d8-47d2-82fc-728970c08366macos-catalina-5120x2880-day-mountains-wwdc-2019-5k-21590%20(22).jpg',
          etag: 'ef8781f4a83faa611944f57e3aacb3c4-1',
        },
      };
      await users.insertOne(mockUser);
      userProvider = new UserProvider(users);
    });

    afterEach(async () => {
      await db.collection('users').drop();
    });

    test('Should soft-delete user without error.', async () => {
      const existedId = '5e68995fb6d0bc05829b6e79';
      await userProvider.delete(existedId);
      const foundedUser = await db.collection('users').findOne({ _id: ObjectId(existedId) });
      expect(foundedUser.deleted).toEqual(true);
    });

    test('Deleting and re-fetching.', async () => {
      const existedId = '5e68995fb6d0bc05829b6e79';
      const user = await userProvider.findById(existedId);
      await userProvider.delete(existedId);
      const deletedUser = await userProvider.findById(existedId);
      expect(user).toBeInstanceOf(User);
      expect(deletedUser).toEqual(null);
    });

    test('Should throw error when received user does not exist.', () => {
      const newId = ObjectId();
      expect(
        userProvider.delete(newId),
      ).rejects.toEqual(new ResourceNotFoundError('User', `id: ${newId}`));
    });
  });

  describe('#find', () => {
    beforeEach(async () => {
      const users = db.collection('users');
      const mocksUser = [
        {
          name: 'Antonio',
          email: 'antonio@example.com',
          password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
          lastModified: '2020-04-03T09:39:20.350Z',
          deleted: false,
        },
        {
          name: 'Steve',
          email: 'steve@example.com',
          password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
          lastModified: '2020-04-03T09:39:20.350Z',
          deleted: false,
        },
        {
          name: 'Sam',
          email: 'sam@example.com',
          password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
          lastModified: '2020-04-03T09:39:20.350Z',
          deleted: false,
        },
        {
          name: 'John',
          email: 'john@example.com',
          password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
          lastModified: '2020-04-03T09:39:20.350Z',
          deleted: false,
        },
        {
          name: 'Lucas',
          email: 'lucas@example.com',
          password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
          lastModified: '2020-04-03T09:39:20.350Z',
          deleted: false,
        },
        {
          name: 'Mike',
          email: 'mike@example.com',
          password: '$2b$10$a2Yvs6zYDOgaH1E7UutxTur4ZGZ9XvCCXTDTlLYYnzd8OVxM2ikHS',
          lastModified: '2020-04-03T09:39:20.350Z',
          deleted: false,
        },
      ];
      await users.insertMany(mocksUser);
      userProvider = new UserProvider(users);
    });

    afterEach(async () => {
      userProvider = null;
      db.collection('users').drop();
    });

    test('Should return an array of all messages', async () => {
      const result = await userProvider.find();
      expect(result.total).toEqual(6);
    });

    test('Should return result with hasNext', async () => {
      const result = await userProvider.find({ page: { limit: 5, skip: 0 }, query: {} });
      expect(result.hasNext).toEqual(true);
    });
  });
});
