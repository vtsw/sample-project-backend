const moment = require('moment');

const config = require('../config');
const Bcrypt = require('../services/bcrypt');

module.exports = {
  async up(db, client) {
    const dbname = process.env.DB_NAME || 'simple_db_backup';
    const simpleDb = client.db(dbname);
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
    const simpleDb = client.db(process.env.DB_NAME || 'simple_db_backup');
    await simpleDb.collection('users').remove();
  },
};
