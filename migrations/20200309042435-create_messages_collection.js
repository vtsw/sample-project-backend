const moment = require('moment');
const faker = require('faker');

module.exports = {
  async up(db, client) {
    const simpleDb = client.db('simple_db');
    const users = await simpleDb.collection('users').find({}, { _id: true }).toArray();

    const messages = [];
    users.forEach((user) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 200; i++) {
        const now = moment().format();
        messages.push({
          userId: user._id,
          lastModified: now,
          createdAt: now,
          content: faker.lorem.text(),
          deleted: false,
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
