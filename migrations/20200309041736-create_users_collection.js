const moment = require('moment');

const config = require('../config');
const Bcrypt = require('../services/bcrypt');

module.exports = {
  async up(db, client) {
    const simpleDb = client.db('simple_db');
    const bcrypt = new Bcrypt(config);
    const users = [
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await bcrypt.hash('123'),
        lastModified: moment().format(),
        deleted: false,
      },
      {
        name: 'Sam',
        email: 'sam@example.com',
        password: await bcrypt.hash('123'),
        lastModified: moment().format(),
        deleted: false,
      },
      {
        name: 'Steve',
        email: 'steve@example.com',
        password: await bcrypt.hash('123'),
        lastModified: moment().format(),
        deleted: false,
      },
    ];
    await simpleDb.collection('users').insertMany(users);
  },

  async down(db, client) {
    const simpleDb = client.db('simple_db');
    await simpleDb.collection('users').remove();
  },
};
