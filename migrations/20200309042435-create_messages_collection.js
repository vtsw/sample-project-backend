const moment = require('moment');
const faker = require('faker');

module.exports = {
  async up(db, client) {
    const simpleDb = client.db('simple_db');
    const users = await simpleDb.collection('users').find({}, { _id: 1 }).toArray();

    const messages = [];
    users.forEach((user) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 100; i++) {
        const now = moment().format();
        messages.push({
          userId: user._id,
          lastModified: now,
          createdAt: now,
          content: faker.lorem.text(),
        });
      }
    });
    await simpleDb.collection('messages').insertMany(messages);
  },

  async down(db, client) {
    const simpleDb = client.db('simple_db');
    await simpleDb.collection('messages').deleteMany({});
  },
};
